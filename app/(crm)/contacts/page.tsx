import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { ContactsBoard } from "@/components/modules/ContactsBoard";
import { ContactMessagingWorkspace } from "@/components/modules/ContactMessagingWorkspace";
import { CreateContactForm, CreateAccountForm } from "@/components/modules/QuickCreateForms";
import { EntityEditor } from "@/components/modules/EntityEditor";
import { TimelineCard } from "@/components/modules/TimelineCard";
import { AttachmentUploader } from "@/components/modules/AttachmentUploader";

export default async function ContactsPage() {
  const workspaceId = await requireWorkspaceId();
  const [contacts, accounts] = await Promise.all([
    prisma.contact.findMany({
      where: { workspaceId },
      include: {
        account: true,
        messages: {
          where: { channel: "whatsapp" },
          orderBy: { sentAt: "desc" },
          take: 20,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({ where: { workspaceId }, select: { id: true, name: true } }),
  ]);

  const shapedContacts = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    title: contact.title,
    email: contact.email,
    phone: contact.phone,
    account: contact.account?.name,
    messages: contact.messages.map((msg) => ({
      id: msg.id,
      body: msg.body,
      sentAt: msg.sentAt.toISOString(),
    })),
  }));

  return (
    <>
      <PageHeader moduleKey="contacts" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateContactForm accounts={accounts.map((a) => ({ value: a.id, label: a.name }))} />
        <CreateAccountForm />
        <EntityEditor
          title="Editar contacto"
          subtitle="Actualiza datos de contacto"
          endpoint="/api/crm/contacts"
          fields={[
            { name: "name", label: "Nombre" },
            { name: "email", label: "Email" },
            { name: "phone", label: "Teléfono" },
            { name: "title", label: "Cargo" },
            {
              name: "accountId",
              label: "Cuenta",
              type: "select",
              options: [{ value: "", label: "Sin cuenta" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))],
            },
          ]}
        />
        <TimelineCard entity="contact" options={contacts.map((c) => ({ id: c.id, label: `${c.name} · ${c.email}` }))} />
        <AttachmentUploader entityType="contact" options={contacts.map((c) => ({ id: c.id, label: `${c.name} · ${c.email}` }))} />
      </div>
      <ContactsBoard
        contacts={shapedContacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          title: contact.title,
          email: contact.email,
          phone: contact.phone,
          account: contact.account,
        }))}
      />
      {shapedContacts.length ? <ContactMessagingWorkspace contacts={shapedContacts} /> : null}
    </>
  );
}
