import { PageHeader } from "@/components/modules/PageHeader";
import { AiPlayground } from "@/components/modules/AiPlayground";
import { getWorkspaceFeatures, requireWorkspaceId } from "@/lib/db/workspace";
import { AgentManager } from "@/components/modules/AgentManager";

export default async function AiPage() {
  const workspaceId = await requireWorkspaceId();
  const features = await getWorkspaceFeatures(workspaceId);
  if (features && !features.enableAi) {
    return (
      <div className="space-y-4">
        <PageHeader moduleKey="ai" />
        <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          AI deshabilitado para este workspace.
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader moduleKey="ai" />
      <AiPlayground />
      <AgentManager />
    </>
  );
}
