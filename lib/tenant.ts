import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Resolves the tenant from its URL slug AND verifies the current user is a
 * member of it. This single function is the multi-tenant isolation
 * boundary for every server component / server action in the /app/[tenant]
 * route tree: if it doesn't return a membership, the caller has no
 * business seeing that tenant's data.
 */
export async function requireTenantMembership(tenantSlug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) redirect("/dashboard");

  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId: tenant.id } },
  });

  // Not a member of this tenant: never leak that the tenant exists.
  if (!membership) redirect("/dashboard");

  if (tenant.suspended) redirect("/suspended");

  return { session, user: session.user, tenant, membership };
}

export async function requireRole(tenantSlug: string, allowed: string[]) {
  const ctx = await requireTenantMembership(tenantSlug);
  if (!allowed.includes(ctx.membership.role)) {
    redirect(`/app/${tenantSlug}/dashboard?error=forbidden`);
  }
  return ctx;
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) redirect("/login");
  return session;
}

/** All tenants the signed-in user belongs to (for the workspace switcher). */
export async function getUserTenants(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({ role: m.role, tenant: m.tenant }));
}
