"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantMembership } from "@/lib/tenant";
import { can } from "@/lib/rbac";
import { requiresPlanFeature } from "@/lib/limits";
import { generateApiKey } from "@/lib/apikeys";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateBranding(tenantSlug: string, formData: FormData): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "branding.manage")) return { ok: false, error: "You don't have permission to change branding." };
  if (!requiresPlanFeature(tenant, "customBranding")) {
    return { ok: false, error: "Custom branding is available on the Pro and Enterprise plans." };
  }

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      companyName: String(formData.get("companyName") ?? "").trim() || null,
      logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
      primaryColor: String(formData.get("primaryColor") ?? "#4F46E5"),
    },
  });

  revalidatePath(`/app/${tenantSlug}/settings/branding`);
  return { ok: true };
}

export async function createApiKey(
  tenantSlug: string,
  name: string
): Promise<ActionResult & { key?: string }> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "apikeys.manage")) return { ok: false, error: "You don't have permission to manage API keys." };
  if (!requiresPlanFeature(tenant, "apiAccess")) {
    return { ok: false, error: "API access is available on the Pro and Enterprise plans." };
  }

  const key = generateApiKey();
  await prisma.apiKey.create({
    data: { tenantId: tenant.id, name: name.trim() || "Untitled key", key },
  });

  revalidatePath(`/app/${tenantSlug}/settings/api`);
  return { ok: true, key };
}

export async function revokeApiKey(tenantSlug: string, keyId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "apikeys.manage")) return { ok: false, error: "You don't have permission to manage API keys." };

  await prisma.apiKey.updateMany({
    where: { id: keyId, tenantId: tenant.id },
    data: { revoked: true },
  });

  revalidatePath(`/app/${tenantSlug}/settings/api`);
  return { ok: true };
}
