"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/tenant";

export async function setTenantSuspended(tenantId: string, suspended: boolean) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id: tenantId }, data: { suspended } });
  revalidatePath("/admin");
  revalidatePath(`/admin/tenants/${tenantId}`);
}
