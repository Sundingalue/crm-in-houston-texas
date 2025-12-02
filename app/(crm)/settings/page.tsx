import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { SettingsPanel } from "@/components/modules/SettingsPanel";
import { TeamManager } from "@/components/modules/TeamManager";
import { AutomationStudio } from "@/components/modules/AutomationStudio";
import { InviteUserForm } from "@/components/modules/QuickCreateForms";
import { UserEditor } from "@/components/modules/UserEditor";
import { RoleManager } from "@/components/modules/RoleManager";
import { AttachmentPanel } from "@/components/modules/AttachmentPanel";
import { CustomFieldManager } from "@/components/modules/CustomFieldManager";
import { PipelineConfigurator } from "@/components/modules/PipelineConfigurator";
import { AutomationRuleBuilder } from "@/components/modules/AutomationRuleBuilder";
import { SegmentBuilder } from "@/components/modules/SegmentBuilder";
import { InviteLinkCard } from "@/components/modules/InviteLinkCard";
import { UserPermissionDrawer } from "@/components/modules/UserPermissionDrawer";

const envDescriptions = [
  { key: "DATABASE_URL", description: "Conexión Prisma" },
  { key: "EMAIL_API_KEY", description: "Proveedor de emails" },
  { key: "WHATSAPP_API_KEY", description: "Meta/Twilio Business API" },
  { key: "VOICE_API_KEY", description: "Telefónica / WebRTC" },
  { key: "AI_AGENT_API_KEY", description: "Modelo de agentes" },
  { key: "AI_SEARCH_API_KEY", description: "Buscador vectorial" },
];

export default async function SettingsPage() {
  const workspaceId = await requireWorkspaceId();
  const users = await prisma.user.findMany({
    where: { workspaceId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return (
    <>
      <PageHeader moduleKey="settings" />
      <SettingsPanel envs={envDescriptions} />
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamManager users={users} />
        <InviteUserForm />
        <InviteLinkCard />
        <UserEditor />
        <RoleManager />
        <UserPermissionDrawer />
        <AttachmentPanel />
        <CustomFieldManager />
        <PipelineConfigurator />
        <AutomationRuleBuilder />
        <SegmentBuilder />
      </div>
      <AutomationStudio />
    </>
  );
}
