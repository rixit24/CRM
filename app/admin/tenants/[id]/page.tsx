import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { setTenantSuspended } from "@/lib/actions/admin";
import { PLANS, type PlanId } from "@/lib/plans";

export default async function AdminTenantDetail({ params }: { params: { id: string } }) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: { memberships: { include: { user: true } } },
  });
  if (!tenant) notFound();

  async function toggleSuspend() {
    "use server";
    await setTenantSuspended(tenant!.id, !tenant!.suspended);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">{tenant.name}</h1>
      <p className="mt-1 font-mono text-sm text-ink-soft">{tenant.slug}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-white p-6">
          <h2 className="font-display font-bold text-ink">Plan & billing</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Plan">{PLANS[tenant.plan as PlanId].name}</Row>
            <Row label="Status">{tenant.subscriptionStatus ?? "—"}</Row>
            <Row label="Stripe customer">{tenant.stripeCustomerId ?? "—"}</Row>
            <Row label="Renews">
              {tenant.stripeCurrentPeriodEnd ? tenant.stripeCurrentPeriodEnd.toLocaleDateString() : "—"}
            </Row>
          </dl>
        </div>

        <div className="rounded-lg border border-hairline bg-white p-6">
          <h2 className="font-display font-bold text-ink">Access</h2>
          <p className="mt-3 text-sm text-ink-soft">
            {tenant.suspended
              ? "This workspace is suspended. Members can't sign in to it."
              : "This workspace is active."}
          </p>
          <form action={toggleSuspend} className="mt-4">
            <button
              className={`rounded px-4 py-2 text-sm font-medium ${
                tenant.suspended
                  ? "bg-pine text-paper hover:opacity-90"
                  : "bg-red-600 text-white hover:opacity-90"
              }`}
            >
              {tenant.suspended ? "Unsuspend workspace" : "Suspend workspace"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {tenant.memberships.map((m) => (
              <tr key={m.id} className="border-b border-hairline last:border-0">
                <td className="px-5 py-3 text-ink">{m.user.name ?? "—"}</td>
                <td className="px-5 py-3 text-ink-soft">{m.user.email}</td>
                <td className="px-5 py-3 font-mono text-xs uppercase text-ink-soft">{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-hairline pb-2 last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}
