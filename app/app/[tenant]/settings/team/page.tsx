import { requireTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { can } from "@/lib/rbac";
import { inviteTeammate, changeRole, removeMember } from "@/lib/actions/team";
import { PLANS, type PlanId } from "@/lib/plans";
import type { Role } from "@/lib/rbac";

export default async function TeamSettingsPage({ params }: { params: { tenant: string } }) {
  const { tenant, membership } = await requireTenantMembership(params.tenant);

  const [members, invites] = await Promise.all([
    prisma.membership.findMany({
      where: { tenantId: tenant.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invite.findMany({ where: { tenantId: tenant.id } }),
  ]);

  const canManage = can(membership.role, "team.manage");
  const canRemove = can(membership.role, "team.remove");
  const seatLimit = PLANS[tenant.plan as PlanId].limits.seats;
  async function handleRemove(membershipId: string) { "use server"; await removeMember(tenant.slug, membershipId); }

  async function invite(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const role = String(formData.get("role") ?? "MEMBER") as Role;
    await inviteTeammate(tenant.slug, email, role);
  }

  return (
    <div>
      <PageHeader
        title="Team"
        description={`${members.length}${seatLimit !== Infinity ? ` / ${seatLimit}` : ""} seats used.`}
      />

      <div className="grid grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-hairline bg-white lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Role</th>
                {canRemove && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{m.user.name ?? m.user.email}</div>
                    <div className="text-xs text-ink-soft">{m.user.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    {canManage && m.role !== "OWNER" ? (
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          await changeRole(tenant.slug, m.id, String(formData.get("role")) as Role);
                        }}
                      >
                        <select
                          name="role"
                          defaultValue={m.role}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className="rounded border border-hairline px-2 py-1 text-xs"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Member</option>
                        </select>
                      </form>
                    ) : (
                      <span className="font-mono text-xs uppercase text-ink-soft">{m.role}</span>
                    )}
                  </td>
                  {canRemove && (
                    <td className="px-5 py-3 text-right">
                      {m.role !== "OWNER" && (
                        <form action={handleRemove.bind(null, m.id)}>
                          <button className="text-xs text-ink-soft hover:text-red-600">Remove</button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {invites.length > 0 && (
            <div className="border-t border-hairline p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Pending invites
              </div>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {invites.map((i) => (
                  <li key={i.id}>
                    {i.email} · {i.role.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {canManage && (
          <div className="h-fit rounded-lg border border-hairline bg-white p-6">
            <h2 className="font-display font-bold text-ink">Invite a teammate</h2>
            <form action={invite} className="mt-4 space-y-3">
              <input
                name="email"
                type="email"
                required
                placeholder="teammate@company.com"
                className="w-full rounded border border-hairline px-3 py-2 text-sm"
              />
              <select name="role" className="w-full rounded border border-hairline px-3 py-2 text-sm">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button className="w-full rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft">
                Send invite
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
