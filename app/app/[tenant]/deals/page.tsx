import { requireTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { PipelineBoard } from "@/components/app/PipelineBoard";
import { NewDealForm } from "@/components/app/NewDealForm";
import { can } from "@/lib/rbac";

export default async function DealsPage({ params }: { params: { tenant: string } }) {
  const { tenant, membership } = await requireTenantMembership(params.tenant);

  const [stages, deals, contacts] = await Promise.all([
    prisma.pipelineStage.findMany({ where: { tenantId: tenant.id }, orderBy: { order: "asc" } }),
    prisma.deal.findMany({
      where: { tenantId: tenant.id },
      include: { contact: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true } }),
  ]);

  const canEdit = can(membership.role, "deals.edit");

  return (
    <div className="relative">
      <PageHeader
        title="Pipeline"
        description="Drag a deal to a new stage, or add one on the right."
        action={canEdit && <NewDealForm tenantSlug={tenant.slug} stages={stages} contacts={contacts} />}
      />

      {stages.length === 0 ? (
        <div className="px-8 py-16 text-center text-ink-soft">
          No pipeline stages yet. Add one from Settings.
        </div>
      ) : (
        <div className="pt-6">
          <PipelineBoard
            tenantSlug={tenant.slug}
            stages={stages}
            initialDeals={deals as any}
            canEdit={canEdit}
          />
        </div>
      )}
    </div>
  );
}
