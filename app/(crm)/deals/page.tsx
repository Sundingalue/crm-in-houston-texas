import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { DealsTable } from "@/components/modules/DealsTable";
import { PipelineBoard } from "@/components/dashboard/PipelineBoard";
import { CreateDealForm } from "@/components/modules/QuickCreateForms";
import { EntityEditor } from "@/components/modules/EntityEditor";
import { AttachmentUploader } from "@/components/modules/AttachmentUploader";
import { TimelineCard } from "@/components/modules/TimelineCard";

export default async function DealsPage() {
  const workspaceId = await requireWorkspaceId();
  const [deals, accounts, leads, stages] = await Promise.all([
    prisma.deal.findMany({
      where: { workspaceId },
      include: { account: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({ where: { workspaceId }, select: { id: true, name: true } }),
    prisma.lead.findMany({ where: { workspaceId }, select: { id: true, name: true } }),
    prisma.pipelineStage.findMany({ where: { workspaceId }, orderBy: { order: "asc" } }),
  ]);

  const stageList = stages.length
    ? stages.map((s) => s.name)
    : ["descubrimiento", "calificacion", "negociacion", "cierre"];

  const pipelineColumns = stageList.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage);
    return {
      name: stage,
      deals: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
      note: stageDeals.length ? undefined : "Sin datos",
    };
  });

  return (
    <>
      <PageHeader moduleKey="deals" />
      <CreateDealForm
        accounts={accounts.map((a) => ({ value: a.id, label: a.name }))}
        leads={leads.map((l) => ({ value: l.id, label: l.name }))}
        stages={stageList.map((s) => ({ value: s, label: s }))}
      />
      <EntityEditor
        title="Editar oportunidad"
        subtitle="Actualiza valor, etapa y relación"
        endpoint="/api/crm/deals"
        fields={[
          { name: "name", label: "Nombre" },
          { name: "value", label: "Valor", type: "number" },
          {
            name: "stage",
            label: "Etapa",
            type: "select",
            options: stageList.map((s) => ({ value: s, label: s })),
          },
          {
            name: "accountId",
            label: "Cuenta",
            type: "select",
            options: [{ value: "", label: "Sin cuenta" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))],
          },
          {
            name: "leadId",
            label: "Lead",
            type: "select",
            options: [{ value: "", label: "Sin lead" }, ...leads.map((l) => ({ value: l.id, label: l.name }))],
          },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <TimelineCard entity="lead" options={leads.map((l) => ({ id: l.id, label: l.name }))} />
        <AttachmentUploader entityType="deal" options={deals.map((d) => ({ id: d.id, label: d.name }))} />
      </div>
      <PipelineBoard columns={pipelineColumns} />
      <DealsTable
        deals={deals.map((deal) => ({
          id: deal.id,
          name: deal.name,
          stage: deal.stage,
          value: deal.value,
          closeDate: deal.closeDate?.toISOString() ?? null,
          account: deal.account?.name ?? null,
        }))}
      />
    </>
  );
}
