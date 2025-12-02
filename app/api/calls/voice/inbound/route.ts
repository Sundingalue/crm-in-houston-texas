import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { logError } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get("From")?.toString() ?? "";
    const to = formData.get("To")?.toString() ?? "";
    const callSid = formData.get("CallSid")?.toString() ?? "";

    await prisma.activity.create({
      data: {
        type: "llamada",
        summary: `Llamada entrante de ${from}`,
        workspaceId: process.env.DEMO_WORKSPACE_ID ?? (await prisma.workspace.findFirst())?.id ?? "",
        notes: `To ${to} · CallSid ${callSid}`,
      },
    });

    const twiml = `<Response><Say voice="alice">Gracias por llamar. Este es un webhook placeholder.</Say></Response>`;
    return new NextResponse(twiml, { status: 200, headers: { "Content-Type": "application/xml" } });
  } catch (error) {
    await logError("TWILIO_INBOUND_ERROR", { error: String(error) });
    return NextResponse.json({ message: "TWILIO_INBOUND_ERROR" }, { status: 500 });
  }
}
