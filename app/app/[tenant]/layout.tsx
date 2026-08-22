import { requireTenantMembership } from "@/lib/tenant";
import { Sidebar } from "@/components/app/Sidebar";

export default async function TenantAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}) {
  const { tenant, membership } = await requireTenantMembership(params.tenant);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        tenantSlug={tenant.slug}
        tenantName={tenant.companyName ?? tenant.name}
        role={membership.role}
        plan={tenant.plan}
      />
      <main className="flex-1 overflow-y-auto bg-paper">{children}</main>
    </div>
  );
}
