import { requireTenantMembership } from "@/lib/tenant";
import { PageHeader } from "@/components/app/PageHeader";
import { BillingPanel } from "@/components/app/BillingPanel";

export default async function BillingSettingsPage({ params }: { params: { tenant: string } }) {
  const { tenant, membership } = await requireTenantMembership(params.tenant);

  return (
    <div>
      <PageHeader
        title="Billing"
        description={
          tenant.subscriptionStatus === "past_due"
            ? "Your last payment failed — update your payment method to avoid interruption."
            : "Manage your plan and payment details."
        }
      />
      <div className="px-8 py-6">
        <BillingPanel
          tenantSlug={tenant.slug}
          currentPlan={tenant.plan}
          hasStripeCustomer={!!tenant.stripeCustomerId}
          isOwner={membership.role === "OWNER"}
        />
      </div>
    </div>
  );
}
