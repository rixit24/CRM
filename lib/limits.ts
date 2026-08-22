import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/plans";
import type { Tenant } from "@prisma/client";

export class LimitError extends Error {}

/** Throws LimitError with a user-facing message if the tenant is at its plan cap. */
export async function assertWithinLimit(
  tenant: Tenant,
  resource: "seats" | "contacts" | "deals"
) {
  const limit = PLANS[tenant.plan as PlanId].limits[resource];
  if (limit === Infinity) return;

  let count = 0;
  if (resource === "seats") {
    count = await prisma.membership.count({ where: { tenantId: tenant.id } });
  } else if (resource === "contacts") {
    count = await prisma.contact.count({ where: { tenantId: tenant.id } });
  } else if (resource === "deals") {
    count = await prisma.deal.count({ where: { tenantId: tenant.id } });
  }

  if (count >= limit) {
    const label = resource === "seats" ? "team members" : resource;
    throw new LimitError(
      `Your ${PLANS[tenant.plan as PlanId].name} plan allows up to ${limit} ${label}. Upgrade to add more.`
    );
  }
}

export function requiresPlanFeature(
  tenant: Tenant,
  feature: "apiAccess" | "customBranding"
) {
  return PLANS[tenant.plan as PlanId].limits[feature];
}
