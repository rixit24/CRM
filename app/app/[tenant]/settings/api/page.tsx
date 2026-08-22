import { requireTenantMembership } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/app/PageHeader";
import { requiresPlanFeature } from "@/lib/limits";
import { ApiKeyManager } from "@/components/app/ApiKeyManager";
import Link from "next/link";

function mask(key: string) {
  return `${key.slice(0, 12)}${"•".repeat(8)}${key.slice(-4)}`;
}

export default async function ApiSettingsPage({ params }: { params: { tenant: string } }) {
  const { tenant } = await requireTenantMembership(params.tenant);
  const unlocked = requiresPlanFeature(tenant, "apiAccess");

  const keys = await prisma.apiKey.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="API access"
        description="Read and write contacts and deals from your own tools."
      />

      <div className="px-8 py-6">
        {!unlocked ? (
          <div className="max-w-lg rounded-lg border border-dashed border-hairline bg-white p-8 text-center">
            <p className="text-ink-soft">API access is available on the Pro and Enterprise plans.</p>
            <Link
              href={`/app/${tenant.slug}/settings/billing`}
              className="mt-4 inline-block rounded bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold-soft"
            >
              Upgrade to unlock
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-lg border border-hairline bg-white p-6 text-sm">
              <h2 className="font-display font-bold text-ink">Using the API</h2>
              <p className="mt-2 text-ink-soft">
                Send your key as a bearer token. Base URL:{" "}
                <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs">
                  {process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com"}/api/v1
                </code>
              </p>
              <pre className="mt-3 overflow-x-auto rounded bg-ink p-4 font-mono text-xs text-paper">
{`curl ${process.env.NEXT_PUBLIC_APP_URL ?? "https://yourapp.com"}/api/v1/contacts \\
  -H "Authorization: Bearer crm_live_..."`}
              </pre>
            </div>

            <ApiKeyManager
              tenantSlug={tenant.slug}
              initialKeys={keys.map((k) => ({
                id: k.id,
                name: k.name,
                key: mask(k.key),
                revoked: k.revoked,
                createdAt: k.createdAt.toISOString(),
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
