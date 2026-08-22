import { requireTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { PLANS, type PlanId } from "@/lib/plans";
import Link from "next/link";

export default async function DashboardPage({ params }: { params: { tenant: string } }) {
  const { tenant, user } = await requireTenantMembership(params.tenant);

  const [contactCount, openDeals, wonDeals, recentActivity] = await Promise.all([
    prisma.contact.count({ where: { tenantId: tenant.id } }),
    prisma.deal.findMany({ where: { tenantId: tenant.id, status: "OPEN" } }),
    prisma.deal.findMany({ where: { tenantId: tenant.id, status: "WON" } }),
    prisma.activity.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { deal: true, contact: true, user: true },
    }),
  ]);

  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
  const limits = PLANS[tenant.plan as PlanId].limits;

  const stats = [
    { label: "Open pipeline value", value: `$${pipelineValue.toLocaleString()}` },
    { label: "Won this workspace", value: `$${wonValue.toLocaleString()}` },
    { label: "Open deals", value: openDeals.length },
    {
      label: "Contacts",
      value: `${contactCount}${limits.contacts !== Infinity ? ` / ${limits.contacts}` : ""}`,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${(user.name as string)?.split(" ")[0] ?? "there"}`}
        description="Here's where the pipeline stands right now."
      />

      <div className="grid grid-cols-1 gap-4 px-8 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-hairline bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              {s.label}
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-ink">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 px-8 pb-8 lg:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-white p-6 lg:col-span-2">
          <h2 className="font-display font-bold text-ink">Recent activity</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              Nothing logged yet. Notes and calls you add to a deal or contact will show up here.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {recentActivity.map((a) => (
                <li key={a.id} className="border-l-2 border-pine pl-4 text-sm">
                  <div className="font-medium text-ink">
                    {a.type} · {a.deal?.title ?? a.contact?.name ?? "—"}
                  </div>
                  <div className="text-ink-soft">{a.content}</div>
                  <div className="mt-0.5 font-mono text-xs text-ink-soft/70">
                    {a.user?.name ?? "Someone"} · {a.createdAt.toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-hairline bg-white p-6">
          <h2 className="font-display font-bold text-ink">Quick links</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Link href={`/app/${tenant.slug}/deals`} className="block text-pine hover:underline">
              Open the pipeline board →
            </Link>
            <Link href={`/app/${tenant.slug}/contacts`} className="block text-pine hover:underline">
              Add a contact →
            </Link>
            <Link
              href={`/app/${tenant.slug}/settings/team`}
              className="block text-pine hover:underline"
            >
              Invite a teammate →
            </Link>
            {tenant.plan === "FREE" && (
              <Link
                href={`/app/${tenant.slug}/settings/billing`}
                className="block font-medium text-gold hover:underline"
              >
                Upgrade your plan →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
