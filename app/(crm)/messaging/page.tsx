import { prisma } from "@/lib/db/client";
import { getWorkspaceFeatures, requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { WhatsAppWorkspace } from "@/components/modules/WhatsAppWorkspace";
import { SocialDmWorkspace } from "@/components/modules/SocialDmWorkspace";
import { ImapInbox } from "@/components/modules/ImapInbox";

export default async function MessagingPage() {
  const workspaceId = await requireWorkspaceId();
  const features = await getWorkspaceFeatures(workspaceId);
  if (features && !features.enableWhatsApp) {
    return (
      <div className="space-y-4">
        <PageHeader moduleKey="messaging" />
        <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-100">
          Mensajería deshabilitada para este workspace.
        </div>
      </div>
    );
  }
  const contacts = await prisma.contact.findMany({
    where: { workspaceId },
    select: { id: true, name: true, phone: true, email: true },
  });

  return (
    <>
      <PageHeader moduleKey="messaging" />
      <WhatsAppWorkspace contacts={contacts} />
      <SocialDmWorkspace contacts={contacts} />
      <ImapInbox />
    </>
  );
}
