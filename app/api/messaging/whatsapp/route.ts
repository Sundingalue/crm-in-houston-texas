import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MessageChannel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { ensureFeatureEnabled, requireWorkspaceId } from "@/lib/db/workspace";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { logError } from "@/lib/utils/logger";
import { ensurePermission } from "@/lib/auth/permissions";

// Respuesta del proveedor compatible con JSON de Prisma
type ProviderResponse = Prisma.InputJsonValue;

const whatsappSchema = z.object({
  contactId: z.string(),
  phone: z.string(),
  message: z.string().min(2),
});

const normalizePhone = (phone: string) =>
  phone
    .replace("whatsapp:", "")
    .replace(/[^\d+]/g, "")
    .replace(/^00/, "+");

export async function GET(request: NextRequest) {
  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "whatsapp");
  if (!enabled)
    return NextResponse.json(
      { message: "WHATSAPP_DISABLED" },
      { status: 403 }
    );

  await ensurePermission(workspaceId, "messaging", "view");
  const contactId = request.nextUrl.searchParams.get("contactId") ?? undefined;

  const history = await prisma.message.findMany({
    where: {
      workspaceId,
      channel: MessageChannel.whatsapp,
      ...(contactId ? { contactId } : {}),
    },
    include: {
      contact: { select: { id: true, name: true } },
    },
    orderBy: { sentAt: "desc" },
    take: contactId ? 100 : 25,
  });

  return NextResponse.json(history);
}

async function sendViaTwilio(payload: {
  phone: string;
  message: string;
}): Promise<ProviderResponse | null> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !whatsappFrom) {
    return null;
  }

  if (!payload.phone.startsWith("+") && !payload.phone.startsWith("whatsapp:")) {
    throw new Error("PHONE_FORMAT_INVALID");
  }

  const form = new URLSearchParams();
  form.append("To", `whatsapp:${payload.phone}`);
  form.append("From", whatsappFrom);
  form.append("Body", payload.message);

  const twilioResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${accountSid}:${authToken}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    }
  );

  if (!twilioResponse.ok) {
    throw new Error(await twilioResponse.text());
  }

  return (await twilioResponse.json()) as ProviderResponse;
}

async function sendViaWhatsAppCloud(payload: {
  phone: string;
  message: string;
}): Promise<ProviderResponse | null> {
  const token = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return null;
  }

  const body = {
    messaging_product: "whatsapp",
    to: payload.phone,
    type: "text",
    text: { body: payload.message },
  };

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as ProviderResponse;
}

export async function POST(request: Request) {
  const payload = whatsappSchema.parse(await request.json());
  enforceRateLimit(`whatsapp:${payload.contactId}`, 30, 60_000);

  const workspaceId = await requireWorkspaceId();
  const enabled = await ensureFeatureEnabled(workspaceId, "whatsapp");
  if (!enabled)
    return NextResponse.json(
      { message: "WHATSAPP_DISABLED" },
      { status: 403 }
    );

  await ensurePermission(workspaceId, "messaging", "create");

  let providerResponse: ProviderResponse | null = null;
  let provider: "twilio" | "cloud" | null = null;
  const normalizedPhone = normalizePhone(payload.phone);

  try {
    providerResponse = await sendViaTwilio({
      phone: normalizedPhone,
      message: payload.message,
    });
    provider = providerResponse ? "twilio" : null;

    if (!providerResponse) {
      providerResponse = await sendViaWhatsAppCloud({
        phone: normalizedPhone,
        message: payload.message,
      });
      provider = providerResponse ? "cloud" : null;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown provider error";
    await logError("WHATSAPP_PROVIDER_ERROR", {
      error: message,
      contactId: payload.contactId,
      workspaceId,
    });
    return NextResponse.json(
      { message: "WHATSAPP_PROVIDER_ERROR", details: message },
      { status: 502 }
    );
  }

  if (!providerResponse || !provider) {
    return NextResponse.json(
      {
        message: "WHATSAPP_PROVIDER_MISSING",
      },
      { status: 501 }
    );
  }

  // Si no viene contactId, intentamos resolverlo por teléfono
  let resolvedContactId: string | undefined = payload.contactId;
  if (!resolvedContactId) {
    const contact = await prisma.contact.findFirst({
      where: {
        workspaceId,
        OR: [
          { phone: { contains: normalizedPhone.slice(-8) } },
          { phone: normalizedPhone },
        ],
      },
      select: { id: true },
    });
    resolvedContactId = contact?.id;
  }

  const record = await prisma.message.create({
    data: {
      channel: MessageChannel.whatsapp,
      body: payload.message,
      contactId: resolvedContactId ?? payload.contactId,
      workspaceId,
      metadata: {
        phone: normalizedPhone,
        provider,
        response: providerResponse,
      } as Prisma.InputJsonValue,
    },
    include: {
      contact: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    message: "Mensaje enviado",
    provider,
    record,
  });
}
