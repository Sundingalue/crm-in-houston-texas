import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { AnalyticsOverview } from "@/components/dashboard/AnalyticsOverview";
import { CampaignsPanel } from "@/components/dashboard/CampaignsPanel";
import { AdvancedFunnel } from "@/components/modules/AdvancedFunnel";

export default async function MarketingPage() {
  const workspaceId = await requireWorkspaceId();
  const [leads, deals, campaigns] = await Promise.all([
    prisma.lead.findMany({ where: { workspaceId } }),
    prisma.deal.findMany({ where: { workspaceId } }),
    prisma.campaign.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
  ]);

  const stats = [
    { label: "Leads", value: leads.length.toString(), trend: "+12% MoM" },
    { label: "Deals activos", value: deals.length.toString(), trend: "Embudos saludables" },
    {
      label: "Valor pipeline",
      value: `€${Math.round(deals.reduce((sum, deal) => sum + deal.value, 0) / 1000)}k`,
      trend: "Q2 forecast",
    },
    { label: "Campañas", value: campaigns.length.toString(), trend: "Últimos 30 días" },
  ];

  const performance = [
    { label: "Funnel", value: 80 },
    { label: "Por usuario", value: 65 },
    { label: "Por campaña", value: 75 },
    { label: "ROI", value: 68 },
  ];

  const sourceTotals = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] ?? 0) + 1;
    return acc;
  }, {});

  const sources = Object.entries(sourceTotals).map(([source, total]) => ({
    canal: source,
    porcentaje: `${Math.round((total / Math.max(leads.length, 1)) * 100)}%`,
  }));

  const advancedFunnel = [
    { name: "Descubrimiento", conversion: 72, value: 180000, velocityDays: 6 },
    { name: "Propuesta", conversion: 54, value: 120000, velocityDays: 9 },
    { name: "Negociación", conversion: 33, value: 90000, velocityDays: 12 },
    { name: "Cierre", conversion: 22, value: 64000, velocityDays: 15 },
  ];

  return (
    <>
      <PageHeader moduleKey="marketing" />
      <AnalyticsOverview stats={stats} performance={performance} sources={sources} />
      <AdvancedFunnel stages={advancedFunnel} />
      <CampaignsPanel
        campaigns={campaigns.map((campaign) => ({
          ...campaign,
          createdAt: campaign.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
