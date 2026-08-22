import { requireTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { StageValueChart } from "@/components/app/ReportCharts";

export default async function ReportsPage({ params }: { params: { tenant: string } }) {
  const { tenant } = await requireTenantMembership(params.tenant);

  const [stages, deals] = await Promise.all([
    prisma.pipelineStage.findMany({ where: { tenantId: tenant.id }, orderBy: { order: "asc" } }),
    prisma.deal.findMany({ where: { tenantId: tenant.id } }),
  ]);

  const stageValues = stages.map((s) => ({
    name: s.name,
    value: deals.filter((d) => d.stageId === s.id && d.status === "OPEN").reduce((sum, d) => sum + d.value, 0),
  }));

  const won = deals.filter((d) => d.status === "WON");
  const lost = deals.filter((d) => d.status === "LOST");
  const closed = won.length + lost.length;
  const winRate = closed === 0 ? null : Math.round((won.length / closed) * 100);
  const avgDealSize = deals.length === 0 ? 0 : deals.reduce((s, d) => s + d.value, 0) / deals.length;

  return (
    <div>
      <PageHeader title="Reports" description="Where the pipeline stands, and how deals close." />

      <div className="grid grid-cols-1 gap-4 px-8 py-6 sm:grid-cols-3">
        <div className="rounded-lg border border-hairline bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-soft">Win rate</div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            {winRate === null ? "—" : `${winRate}%`}
          </div>
          <div className="mt-1 text-xs text-ink-soft">
            {won.length} won · {lost.length} lost
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Average deal size
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            ${Math.round(avgDealSize).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Total deals tracked
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">{deals.length}</div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="rounded-lg border border-hairline bg-white p-6">
          <h2 className="font-display font-bold text-ink">Open pipeline value by stage</h2>
          <div className="mt-4">
            <StageValueChart data={stageValues} />
          </div>
        </div>
      </div>

      <div className="px-8 pb-10">
        <div className="rounded-lg border border-hairline bg-white p-6">
          <h2 className="font-display font-bold text-ink">Export data</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Take your contacts and deals with you, any time — on every plan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              className="rounded border border-hairline px-3 py-1.5 text-ink hover:border-ink"
              href={`/api/export?tenant=${tenant.slug}&resource=contacts&format=csv`}
            >
              Contacts (CSV)
            </a>
            <a
              className="rounded border border-hairline px-3 py-1.5 text-ink hover:border-ink"
              href={`/api/export?tenant=${tenant.slug}&resource=contacts&format=json`}
            >
              Contacts (JSON)
            </a>
            <a
              className="rounded border border-hairline px-3 py-1.5 text-ink hover:border-ink"
              href={`/api/export?tenant=${tenant.slug}&resource=deals&format=csv`}
            >
              Deals (CSV)
            </a>
            <a
              className="rounded border border-hairline px-3 py-1.5 text-ink hover:border-ink"
              href={`/api/export?tenant=${tenant.slug}&resource=deals&format=json`}
            >
              Deals (JSON)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
