import { prisma } from "@/lib/db/client";
import { getWorkspaceFeatures, requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { CallConsole } from "@/components/modules/CallConsole";

export default async function CallsPage() {
  const workspaceId = await requireWorkspaceId();
  const features = await getWorkspaceFeatures(workspaceId);
  if (features && !features.enableCalls) {
    return (
      <div className="space-y-4">
        <PageHeader moduleKey="calls" />
        <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Llamadas deshabilitadas para este workspace.
        </div>
      </div>
    );
  }
  const contacts = await prisma.contact.findMany({
    where: { workspaceId },
    select: { id: true, name: true, phone: true },
  });
  const lead = await prisma.lead.findFirst({ where: { workspaceId } });

  return (
    <>
      <PageHeader moduleKey="calls" />
      <CallConsole contacts={contacts} defaultLeadId={lead?.id} />
    </>
  );
}
