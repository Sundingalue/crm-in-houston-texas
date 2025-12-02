import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { LeadManagement } from "@/components/dashboard/LeadManagement";
import { PipelineBoard } from "@/components/dashboard/PipelineBoard";
import { CreateLeadForm, CreateContactForm } from "@/components/modules/QuickCreateForms";
import { EntityEditor } from "@/components/modules/EntityEditor";
import { TimelineCard } from "@/components/modules/TimelineCard";
import { AttachmentUploader } from "@/components/modules/AttachmentUploader";

export default async function LeadsPage() {
  const workspaceId = await requireWorkspaceId();
  const [leads, activities, deals, users, accounts] = await Promise.all([
    prisma.lead.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    prisma.activity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.deal.findMany({ where: { workspaceId } }),
    prisma.user.findMany({ where: { workspaceId }, select: { id: true, name: true } }),
    prisma.company.findMany({ where: { workspaceId }, select: { id: true, name: true } }),
  ]);

  const leadRows = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    company: lead.company,
    status: lead.status,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
  }));

  const activityRows = activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    summary: activity.summary,
    createdAt: activity.createdAt.toISOString(),
  }));

  const pipelineColumns = ["descubrimiento", "calificacion", "negociacion", "cierre"].map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage);
    return {
      name: stage,
      deals: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
      note: stageDeals.length ? undefined : "Sin oportunidades",
    };
  });

  return (
    <>
      <PageHeader moduleKey="leads" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateLeadForm owners={users.map((u) => ({ value: u.id, label: u.name }))} />
        <CreateContactForm accounts={accounts.map((a) => ({ value: a.id, label: a.name }))} />
        <EntityEditor
          title="Editar lead"
          subtitle="Actualiza empresa, estado y owner"
          endpoint="/api/crm/leads"
          fields={[
            { name: "name", label: "Nombre" },
            { name: "company", label: "Empresa" },
            { name: "source", label: "Fuente" },
            {
              name: "status",
              label: "Estado",
              type: "select",
              options: [
                { value: "nuevo", label: "nuevo" },
                { value: "contactado", label: "contactado" },
                { value: "calificado", label: "calificado" },
                { value: "negociacion", label: "negociacion" },
                { value: "ganado", label: "ganado" },
                { value: "perdido", label: "perdido" },
              ],
            },
            { name: "ownerId", label: "Owner", type: "select", options: [{ value: "", label: "Sin owner" }, ...users.map((u) => ({ value: u.id, label: u.name }))] },
          ]}
        />
        <TimelineCard entity="lead" options={leads.map((l) => ({ id: l.id, label: `${l.name} · ${l.company}` }))} />
        <AttachmentUploader entityType="lead" options={leads.map((l) => ({ id: l.id, label: `${l.name} · ${l.company}` }))} />
      </div>
      <LeadManagement leads={leadRows} activities={activityRows} />
      <PipelineBoard columns={pipelineColumns} />
    </>
  );
}
