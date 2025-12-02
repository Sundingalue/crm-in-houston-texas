import { prisma } from "@/lib/db/client";
import { requireWorkspaceId } from "@/lib/db/workspace";
import { PageHeader } from "@/components/modules/PageHeader";
import { AccountsOverview } from "@/components/modules/AccountsOverview";
import { CreateAccountForm } from "@/components/modules/QuickCreateForms";
import { EntityEditor } from "@/components/modules/EntityEditor";

export default async function AccountsPage() {
  const workspaceId = await requireWorkspaceId();
  const accounts = await prisma.company.findMany({
    where: { workspaceId },
    include: {
      contacts: true,
      deals: true,
    },
  });

  return (
    <>
      <PageHeader moduleKey="accounts" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CreateAccountForm />
        <EntityEditor
          title="Editar cuenta"
          subtitle="Actualiza industria, tamaño y nombre"
          endpoint="/api/crm/accounts"
          fields={[
            { name: "name", label: "Nombre" },
            { name: "industry", label: "Industria" },
            {
              name: "size",
              label: "Tamaño",
              type: "select",
              options: [
                { value: "startup", label: "startup" },
                { value: "pyme", label: "pyme" },
                { value: "enterprise", label: "enterprise" },
              ],
            },
          ]}
        />
      </div>
      <AccountsOverview
        accounts={accounts.map((account) => ({
          id: account.id,
          name: account.name,
          industry: account.industry,
          size: account.size,
          contacts: account.contacts.length,
          deals: account.deals.length,
        }))}
      />
    </>
  );
}
