import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/plans";
import Link from "next/link";
import clsx from "clsx";

export default async function AdminDashboard() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true, contacts: true, deals: true } } },
  });

  const mrr = tenants.reduce((sum, t) => {
    if (t.subscriptionStatus !== "active" && t.subscriptionStatus !== "trialing") return sum;
    return sum + PLANS[t.plan as PlanId].monthlyPrice;
  }, 0);

  const byPlan = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
  tenants.forEach((t) => byPlan[t.plan as PlanId]++);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Customers</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Stat label="MRR" value={`$${mrr.toLocaleString()}`} />
        <Stat label="Total workspaces" value={tenants.length} />
        <Stat label="Paying (Pro)" value={byPlan.PRO} />
        <Stat label="Paying (Enterprise)" value={byPlan.ENTERPRISE} />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3 font-medium">Workspace</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Seats</th>
              <th className="px-5 py-3 font-medium">Contacts</th>
              <th className="px-5 py-3 font-medium">Deals</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-hairline last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <Link href={`/admin/tenants/${t.id}`} className="font-medium text-ink hover:underline">
                    {t.name}
                  </Link>
                </td>
                <td className="px-5 py-3">{t.plan}</td>
                <td className="px-5 py-3">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      t.suspended
                        ? "bg-red-100 text-red-700"
                        : t.subscriptionStatus === "past_due"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-pine/10 text-pine"
                    )}
                  >
                    {t.suspended ? "Suspended" : t.subscriptionStatus ?? "active"}
                  </span>
                </td>
                <td className="px-5 py-3">{t._count.memberships}</td>
                <td className="px-5 py-3">{t._count.contacts}</td>
                <td className="px-5 py-3">{t._count.deals}</td>
                <td className="px-5 py-3 text-ink-soft">{t.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-hairline bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="mt-2 font-mono text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
