import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { WorkspaceHero } from "@/components/modules/WorkspaceHero";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { PipelineBoard } from "@/components/dashboard/PipelineBoard";
import { LeadManagement } from "@/components/dashboard/LeadManagement";
import { CampaignsPanel } from "@/components/dashboard/CampaignsPanel";
import type { DealStage } from "@prisma/client";

const dealStageOrder: DealStage[] = [
  "descubrimiento",
  "calificacion",
  "propuesta",
  "negociacion",
  "cierre",
  "ganado",
  "perdido",
];

export default async function DashboardPage() {
  const workspaceId = await requireWorkspaceId();
  const [leads, activities, deals, campaigns] = await Promise.all([
    prisma.lead.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    prisma.activity.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.deal.findMany({ where: { workspaceId } }),
    prisma.campaign.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    {
      label: "Leads activos",
      value: leads.length.toString(),
      trend: "+18% vs mes anterior",
    },
    {
      label: "Oportunidades",
      value: deals.length.toString(),
      trend: `${deals.filter((d) => d.stage === "negociacion").length} en negociación`,
    },
    {
      label: "Valor pipeline",
      value: `€${Math.round(deals.reduce((acc, deal) => acc + deal.value, 0) / 1000)}k`,
      trend: "Proyección trimestral",
    },
    {
      label: "Actividades",
      value: activities.length.toString(),
      trend: "Últimas 24h registradas",
    },
  ];

  const performance = [
    { label: "Funnel health", value: 82 },
    { label: "Por ejecutivo", value: 68 },
    { label: "Por campaña", value: 74 },
    { label: "NPS clientes", value: 91 },
  ];

  const sourcesMap = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] ?? 0) + 1;
    return acc;
  }, {});

  const sources = Object.entries(sourcesMap)
    .slice(0, 5)
    .map(([canal, count]) => ({
      canal,
      porcentaje: `${Math.round((count / Math.max(leads.length, 1)) * 100)}%`,
    }));

  const pipelineColumns = dealStageOrder.slice(0, 4).map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage);
    return {
      name: stage,
      deals: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
      note:
        stageDeals.length > 0
          ? "Prioriza seguimiento" //
          : "Sin oportunidades activas",
    };
  });

  const leadRows = leads.slice(0, 6).map((lead) => ({
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

  return (
    <>
      <WorkspaceHero />
      <AnalyticsOverview stats={stats} performance={performance} sources={sources} />
      <PipelineBoard columns={pipelineColumns} />
      <LeadManagement leads={leadRows} activities={activityRows} />
      <CampaignsPanel
        campaigns={campaigns.map((campaign) => ({
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
