import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { prisma } from "@/lib/db/client";

export type ModuleKey =
  | "leads"
  | "contacts"
  | "accounts"
  | "deals"
  | "campaigns"
  | "messaging"
  | "calls"
  | "ai"
  | "automations"
  | "settings";

export type ActionKey = "view" | "create" | "edit" | "delete";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;

const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<ModuleKey, ActionKey[]>> = {
  owner: {
    leads: ["view", "create", "edit", "delete"],
    contacts: ["view", "create", "edit", "delete"],
    accounts: ["view", "create", "edit", "delete"],
    deals: ["view", "create", "edit", "delete"],
    campaigns: ["view", "create", "edit", "delete"],
    messaging: ["view", "create", "edit", "delete"],
    calls: ["view", "create", "edit", "delete"],
    ai: ["view", "create", "edit", "delete"],
    automations: ["view", "create", "edit", "delete"],
    settings: ["view", "create", "edit", "delete"],
  },
  admin: {
    leads: ["view", "create", "edit", "delete"],
    contacts: ["view", "create", "edit", "delete"],
    accounts: ["view", "create", "edit", "delete"],
    deals: ["view", "create", "edit", "delete"],
    campaigns: ["view", "create", "edit", "delete"],
    messaging: ["view", "create", "edit", "delete"],
    calls: ["view", "create", "edit", "delete"],
    ai: ["view", "create", "edit", "delete"],
    automations: ["view", "create", "edit", "delete"],
    settings: ["view", "create", "edit", "delete"],
  },
  seller: {
    leads: ["view", "create", "edit"],
    contacts: ["view", "create", "edit"],
    accounts: ["view"],
    deals: ["view", "create", "edit"],
    campaigns: ["view"],
    messaging: ["view", "create", "edit"],
    calls: ["view", "create"],
    ai: ["view"],
    automations: ["view"],
    settings: ["view"],
  },
  marketing: {
    leads: ["view"],
    contacts: ["view"],
    accounts: ["view"],
    deals: ["view"],
    campaigns: ["view", "create", "edit"],
    messaging: ["view", "create", "edit"],
    calls: ["view"],
    ai: ["view"],
    automations: ["view"],
    settings: ["view"],
  },
  readonly: {
    leads: ["view"],
    contacts: ["view"],
    accounts: ["view"],
    deals: ["view"],
    campaigns: ["view"],
    messaging: ["view"],
    calls: ["view"],
    ai: ["view"],
    automations: ["view"],
    settings: ["view"],
  },
};

export const isSuperAdmin = (email?: string | null) => {
  if (!SUPERADMIN_EMAIL) return false;
  return email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
};

export async function ensurePermission(workspaceId: string, module: ModuleKey, action: ActionKey) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (isSuperAdmin(email)) return;

  const userId = session?.user?.id;
  if (!userId) throw new Error("UNAUTHORIZED");

  const membership = await prisma.userWorkspace.findFirst({
    where: { userId, workspaceId },
    include: { role: { include: { permissions: true } }, permissions: true },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const roleKey = membership?.role?.name?.toLowerCase() ?? user?.role ?? "seller";

  // Direct permissions on membership
  const direct = membership?.permissions;
  if (direct?.length) {
    const match = direct.find((p) => p.module === module && p.action === action);
    if (match) return;
  }

  // Custom permissions per role
  const customPerms = membership?.role?.permissions;
  if (customPerms?.length) {
    const match = customPerms.find((p) => p.module === module && p.action === action);
    if (match) return;
  }

  const allowed = DEFAULT_ROLE_PERMISSIONS[roleKey]?.[module]?.includes(action);
  if (!allowed) {
    throw new Error("FORBIDDEN");
  }
}
