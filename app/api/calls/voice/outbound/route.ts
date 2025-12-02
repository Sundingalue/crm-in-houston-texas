import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { ensurePermission } from "@/lib/auth/permissions";

const outboundSchema = z.object({
  to: z.string(),
  from: z.string().optional(),
  callerId: z.string().optional(),
});

export async function POST(request: Request) {
  const workspaceId = await requireWorkspaceId();
  await ensurePermission(workspaceId, "calls", "create");
  const payload = outboundSchema.parse(await request.json());

  // Placeholder: here you would initiate a Twilio outbound call
  await prisma.activity.create({
    data: {
      type: "llamada",
      summary: `Llamada saliente a ${payload.to}`,
      workspaceId,
      notes: `from ${payload.from ?? "default"} callerId ${payload.callerId ?? ""}`,
    },
  });

  return NextResponse.json({ message: "CALL_OUTBOUND_QUEUED" });
}
