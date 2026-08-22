import { requireTenantMembership } from "@/lib/tenant";
import { PageHeader } from "@/components/app/PageHeader";
import { can } from "@/lib/rbac";
import { updateBranding } from "@/lib/actions/settings";
import { requiresPlanFeature } from "@/lib/limits";
import Link from "next/link";

export default async function BrandingSettingsPage({ params }: { params: { tenant: string } }) {
  const { tenant, membership } = await requireTenantMembership(params.tenant);
  const canManage = can(membership.role, "branding.manage");
  const unlocked = requiresPlanFeature(tenant, "customBranding");

  async function handleUpdate(formData: FormData) { "use server"; await updateBranding(tenant.slug, formData); }
  return (
    <div>
      <PageHeader title="Branding" description="Make the workspace feel like yours." />

      <div className="px-8 py-6">
        {!unlocked ? (
          <div className="max-w-lg rounded-lg border border-dashed border-hairline bg-white p-8 text-center">
            <p className="text-ink-soft">Custom branding is available on the Pro and Enterprise plans.</p>
            <Link
              href={`/app/${tenant.slug}/settings/billing`}
              className="mt-4 inline-block rounded bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold-soft"
            >
              Upgrade to unlock
            </Link>
          </div>
        ) : (
          <form action={handleUpdate} className="max-w-md space-y-4 rounded-lg border border-hairline bg-white p-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Display name</span>
              <input
                name="companyName"
                defaultValue={tenant.companyName ?? tenant.name}
                disabled={!canManage}
                className="w-full rounded border border-hairline px-3 py-2 text-sm disabled:bg-paper"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Logo URL</span>
              <input
                name="logoUrl"
                defaultValue={tenant.logoUrl ?? ""}
                placeholder="https://…"
                disabled={!canManage}
                className="w-full rounded border border-hairline px-3 py-2 text-sm disabled:bg-paper"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Primary color</span>
              <input
                name="primaryColor"
                type="color"
                defaultValue={tenant.primaryColor ?? "#4F46E5"}
                disabled={!canManage}
                className="h-10 w-20 rounded border border-hairline"
              />
            </label>
            {canManage && (
              <button className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft">
                Save branding
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
