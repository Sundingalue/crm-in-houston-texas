import { Suspense } from "react";
import { WorkspacePanel } from "@/components/platform/WorkspacePanel";
import { PageHeader } from "@/components/modules/PageHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { isSuperAdmin } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

export default function PlatformWorkspacesPage() {
  return <GuardedPlatform />;
}

async function GuardedPlatform() {
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

  return (
    <div className="space-y-6">
      <PageHeader moduleKey="settings" />
      <Suspense fallback={<div className="rounded-3xl border border-white/10 p-6 text-sm text-current/60">Cargando workspaces…</div>}>
        <WorkspacePanel />
      </Suspense>
    </div>
  );
}
