import { Card } from "@/components/ui/Card";

export function AnalyticsPlaceholder() {
  return (
    <Card title="Analytics" subtitle="Reporting skeleton" badge="Stub">
      <div className="grid gap-4 md:grid-cols-3">
        {["Leads", "Deals", "Campaigns"].map((label) => (
          <div key={label} className="rounded-2xl border border-white/10 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-current/60">{label}</p>
            <p className="mt-2 text-2xl font-semibold">--</p>
            <p className="text-xs text-current/60">Placeholder metric</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 p-4 text-sm text-current/70">
        Charts and downloadable reports will appear here. Connect real data sources to replace this stub.
      </div>
    </Card>
  );
}
