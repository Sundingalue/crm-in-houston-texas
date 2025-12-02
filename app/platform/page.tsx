import { PageHeader } from "@/components/modules/PageHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function PlatformDashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email || !isSuperAdmin(email)) {
    return (
      <div className="space-y-4">
        <PageHeader moduleKey="settings" />
        <div className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6 text-sm text-rose-100">
          Acceso solo para superadmin. Configura SUPERADMIN_EMAIL y accede con ese usuario.
        </div>
      </div>
    );
  }

  const workspaces = await prisma.workspace.findMany({
    include: {
      users: { select: { id: true } },
      leads: { select: { id: true } },
      contacts: { select: { id: true } },
      deals: { select: { id: true } },
      messages: { select: { id: true } },
      campaigns: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader moduleKey="settings" />
      <div className="grid gap-4 md:grid-cols-3">
        {workspaces.map((ws) => (
          <div key={ws.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-[11px] uppercase tracking-[0.3em] text-current/60">{ws.domain}</p>
            <p className="text-xl font-semibold">{ws.name}</p>
            <p className="text-xs text-current/60">Plan: {ws.plan}</p>
            <p className="text-xs text-current/60">
              Users {ws.users.length} · Leads {ws.leads.length} · Contacts {ws.contacts.length}
            </p>
            <p className="text-xs text-current/60">
              Deals {ws.deals.length} · Messages {ws.messages.length} · Campaigns {ws.campaigns.length}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-current/70">
              <span className={`rounded-xl px-2 py-1 ${ws.enableAi ? "bg-emerald-500/10 border border-emerald-200/40" : "bg-white/5 border border-white/10"}`}>AI</span>
              <span className={`rounded-xl px-2 py-1 ${ws.enableCalls ? "bg-emerald-500/10 border border-emerald-200/40" : "bg-white/5 border border-white/10"}`}>Calls</span>
              <span className={`rounded-xl px-2 py-1 ${ws.enableWhatsApp ? "bg-emerald-500/10 border border-emerald-200/40" : "bg-white/5 border border-white/10"}`}>WhatsApp</span>
              <span className={`rounded-xl px-2 py-1 ${ws.enableAutomations ? "bg-emerald-500/10 border border-emerald-200/40" : "bg-white/5 border border-white/10"}`}>Automations</span>
              <span className={`rounded-xl px-2 py-1 ${ws.enableCampaigns ? "bg-emerald-500/10 border border-emerald-200/40" : "bg-white/5 border border-white/10"}`}>Campaigns</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
