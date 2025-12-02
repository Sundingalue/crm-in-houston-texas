import { headers, cookies } from "next/headers";
import { prisma } from "./client";

const DEFAULT_WORKSPACE_DOMAIN = process.env.DEMO_WORKSPACE_DOMAIN ?? "aurora.demo";
const WORKSPACE_COOKIE = "workspaceId";

export const getActiveWorkspace = async () => {
  const host = (await headers()).get("host") ?? "";
  const domain = host.split(":")[0];

  // Try cookie first
  const cookieStore = await cookies();
  const stored = cookieStore.get(WORKSPACE_COOKIE)?.value;
  try {
    if (stored) {
      const ws = await prisma.workspace.findUnique({ where: { id: stored } });
      if (ws) return ws;
    }
  } catch {
    // ignore
  }

  // Try domain mapping
  try {
    const mapped = await prisma.workspaceDomain.findUnique({
      where: { domain },
      include: { workspace: true },
    });
    if (mapped?.active && mapped.workspace) {
      return mapped.workspace;
    }
  } catch {
    // ignore
  }

  // Fallback to demo workspace
  try {
    return prisma.workspace.findFirst({
      where: { domain: DEFAULT_WORKSPACE_DOMAIN },
    });
  } catch {
    return null;
  }
};

export const requireWorkspaceId = async () => {
  const workspace = await getActiveWorkspace();
  if (!workspace) {
    throw new Error("No se encontró el workspace activo. Ejecuta `npx prisma db seed`.");
  }
  return workspace.id;
};

export const getWorkspaceFeatures = async (workspaceId?: string) => {
  const wsId = workspaceId ?? (await requireWorkspaceId());
  try {
    return await prisma.workspace.findUnique({
      where: { id: wsId },
      select: {
        id: true,
        enableAi: true,
        enableCalls: true,
        enableWhatsApp: true,
        enableAutomations: true,
        enableCampaigns: true,
      },
    });
  } catch {
    // Fallback defaults if schema/client is out of sync
    return {
      id: wsId,
      enableAi: true,
      enableCalls: true,
      enableWhatsApp: true,
      enableAutomations: true,
      enableCampaigns: true,
    };
  }
};

type FeatureKey = "ai" | "calls" | "whatsapp" | "automations" | "campaigns";

export const ensureFeatureEnabled = async (workspaceId: string, feature: FeatureKey) => {
  const ws = await getWorkspaceFeatures(workspaceId);
  if (!ws) return false;
  const allowed =
    feature === "ai"
      ? ws.enableAi
      : feature === "calls"
        ? ws.enableCalls
        : feature === "whatsapp"
          ? ws.enableWhatsApp
          : feature === "automations"
            ? ws.enableAutomations
            : ws.enableCampaigns;
  return Boolean(allowed);
};
