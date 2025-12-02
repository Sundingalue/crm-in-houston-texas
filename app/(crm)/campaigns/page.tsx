import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { CampaignsPanel } from "@/components/dashboard/CampaignsPanel";
import { CreateCampaignForm } from "@/components/modules/QuickCreateForms";
import { EntityEditor } from "@/components/modules/EntityEditor";
import { CampaignSend } from "@/components/modules/CampaignSend";
import { getWorkspaceFeatures } from "@/lib/db/workspace";

export default async function CampaignsPage() {
  const workspaceId = await requireWorkspaceId();
  const features = await getWorkspaceFeatures(workspaceId);
  if (features && !features.enableCampaigns) {
    return (
      <div className="space-y-4">
        <PageHeader moduleKey="campaigns" />
        <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Campañas deshabilitadas para este workspace.
        </div>
      </div>
    );
  }

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader moduleKey="campaigns" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateCampaignForm />
        <CampaignSend />
        <EntityEditor
          title="Editar campaña"
          subtitle="Actualiza asunto, canal y estado"
          endpoint="/api/email/campaigns"
          fields={[
            { name: "name", label: "Nombre" },
            { name: "subject", label: "Asunto" },
            {
              name: "channel",
              label: "Canal",
              type: "select",
              options: [
                { value: "email", label: "email" },
                { value: "whatsapp", label: "whatsapp" },
                { value: "outbound", label: "outbound" },
              ],
            },
            {
              name: "status",
              label: "Estado",
              type: "select",
              options: [
                { value: "borrador", label: "borrador" },
                { value: "activo", label: "activo" },
                { value: "pausa", label: "pausa" },
                { value: "completado", label: "completado" },
              ],
            },
          ]}
        />
      </div>
      <CampaignsPanel
        campaigns={campaigns.map((campaign) => ({
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
