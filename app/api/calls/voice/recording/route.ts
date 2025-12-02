import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { summarizeCall } from "@/lib/ai/call-summary";
import { logError } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const recordingUrl = formData.get("RecordingUrl")?.toString() ?? "";
    const callSid = formData.get("CallSid")?.toString() ?? "";
    const workspace = await prisma.workspace.findFirst({ where: { domain: process.env.DEMO_WORKSPACE_DOMAIN ?? "aurora.demo" } });
    if (!workspace) return NextResponse.json({ message: "WORKSPACE_NOT_FOUND" }, { status: 404 });

    const activity = await prisma.activity.create({
      data: {
        type: "llamada",
        summary: `Grabación de llamada ${callSid}`,
        workspaceId: workspace.id,
        recordingUrl,
      },
    });

    const summarized = await summarizeCall(activity.id, undefined);
    return NextResponse.json({ message: "RECORDING_STORED", activity: summarized });
  } catch (error) {
    await logError("TWILIO_RECORDING_ERROR", { error: String(error) });
    return NextResponse.json({ message: "TWILIO_RECORDING_ERROR" }, { status: 500 });
  }
}
