import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserTenants } from "@/lib/tenant";
import Link from "next/link";

// Landing spot right after login. A user may belong to more than one
// workspace (e.g. a consultant on several customer accounts), so this
// either sends them straight through when there's exactly one, or shows a
// picker when there's more.
export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const tenants = await getUserTenants(userId);

  if (tenants.length === 0) redirect("/register");
  if (tenants.length === 1) redirect(`/app/${tenants[0].tenant.slug}/dashboard`);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Choose a workspace</h1>
      <div className="mt-6 space-y-3">
        {tenants.map(({ tenant, role }) => (
          <Link
            key={tenant.id}
            href={`/app/${tenant.slug}/dashboard`}
            className="flex items-center justify-between rounded border border-hairline bg-white px-5 py-4 hover:border-ink"
          >
            <span className="font-medium text-ink">{tenant.name}</span>
            <span className="font-mono text-xs uppercase text-ink-soft">{role}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
