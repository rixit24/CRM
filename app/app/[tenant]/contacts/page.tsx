import { requireTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { can } from "@/lib/rbac";
import { createContact, deleteContact } from "@/lib/actions/crm";

export default async function ContactsPage({ params }: { params: { tenant: string } }) {
  const { tenant, membership } = await requireTenantMembership(params.tenant);

  const contacts = await prisma.contact.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: { owner: true, _count: { select: { deals: true } } },
  });

  const canEdit = can(membership.role, "contacts.edit");
  const canDelete = can(membership.role, "contacts.delete");

   async function handleCreate(formData: FormData) { "use server"; await createContact(tenant.slug, formData); } async function handleDelete(contactId: string, formData: FormData) { "use server"; await deleteContact(tenant.slug, contactId); }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} people in this workspace.`}
      />

      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-hairline bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Deals</th>
                  {canDelete && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-hairline last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{c.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{c.company ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-soft">{c.email ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-ink-soft">{c._count.deals}</td>
                    {canDelete && (
                      <td className="px-5 py-3 text-right">
                       <form action={handleDelete.bind(null, c.id)}>
                          <button className="text-xs text-ink-soft hover:text-red-600">
                            Delete
                          </button>
                        </form>
                      </td>
                    )}
                  </tr>
                ))}
                {contacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-ink-soft">
                      No contacts yet — add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {canEdit && (
          <div className="h-fit rounded-lg border border-hairline bg-white p-6">
            <h2 className="font-display font-bold text-ink">Add a contact</h2>
            <form action={handleCreate}  className="mt-4 space-y-3">
              <input
                name="name"
                required
                placeholder="Full name"
                className="w-full rounded border border-hairline px-3 py-2 text-sm"
              />
              <input
                name="company"
                placeholder="Company"
                className="w-full rounded border border-hairline px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full rounded border border-hairline px-3 py-2 text-sm"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="w-full rounded border border-hairline px-3 py-2 text-sm"
              />
              <textarea
                name="notes"
                placeholder="Notes"
                rows={3}
                className="w-full rounded border border-hairline px-3 py-2 text-sm"
              />
              <button className="w-full rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft">
                Add contact
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
