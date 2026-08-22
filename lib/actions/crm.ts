"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantMembership } from "@/lib/tenant";
import { can } from "@/lib/rbac";
import { assertWithinLimit, LimitError } from "@/lib/limits";

type ActionResult = { ok: true } | { ok: false; error: string };

// ---------- Contacts ----------

export async function createContact(tenantSlug: string, formData: FormData): Promise<ActionResult> {
  const { tenant, membership, user } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "contacts.edit")) return { ok: false, error: "You don't have permission to add contacts." };

  try {
    await assertWithinLimit(tenant, "contacts");
  } catch (e) {
    if (e instanceof LimitError) return { ok: false, error: e.message };
    throw e;
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      name,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      company: String(formData.get("company") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      ownerId: (user as any).id,
    },
  });

  revalidatePath(`/app/${tenantSlug}/contacts`);
  return { ok: true };
}

export async function updateContact(
  tenantSlug: string,
  contactId: string,
  formData: FormData
): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "contacts.edit")) return { ok: false, error: "You don't have permission to edit contacts." };

  await prisma.contact.updateMany({
    where: { id: contactId, tenantId: tenant.id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      company: String(formData.get("company") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath(`/app/${tenantSlug}/contacts`);
  return { ok: true };
}

export async function deleteContact(tenantSlug: string, contactId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "contacts.delete")) return { ok: false, error: "You don't have permission to delete contacts." };

  await prisma.contact.deleteMany({ where: { id: contactId, tenantId: tenant.id } });
  revalidatePath(`/app/${tenantSlug}/contacts`);
  return { ok: true };
}

// ---------- Deals ----------

export async function createDeal(tenantSlug: string, formData: FormData): Promise<ActionResult> {
  const { tenant, membership, user } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "deals.edit")) return { ok: false, error: "You don't have permission to add deals." };

  try {
    await assertWithinLimit(tenant, "deals");
  } catch (e) {
    if (e instanceof LimitError) return { ok: false, error: e.message };
    throw e;
  }

  const title = String(formData.get("title") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "");
  if (!title || !stageId) return { ok: false, error: "Title and stage are required." };

  const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, tenantId: tenant.id } });
  if (!stage) return { ok: false, error: "Invalid stage." };

  const contactId = String(formData.get("contactId") ?? "") || null;

  await prisma.deal.create({
    data: {
      tenantId: tenant.id,
      title,
      value: Number(formData.get("value") ?? 0) || 0,
      stageId,
      contactId,
      ownerId: (user as any).id,
    },
  });

  revalidatePath(`/app/${tenantSlug}/deals`);
  return { ok: true };
}

export async function moveDeal(tenantSlug: string, dealId: string, stageId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "deals.edit")) return { ok: false, error: "You don't have permission to move deals." };

  const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, tenantId: tenant.id } });
  if (!stage) return { ok: false, error: "Invalid stage." };

  const isWonStage = stage.order === (await prisma.pipelineStage.count({ where: { tenantId: tenant.id } })) - 1;

  await prisma.deal.updateMany({
    where: { id: dealId, tenantId: tenant.id },
    data: { stageId, status: isWonStage ? "WON" : "OPEN" },
  });

  revalidatePath(`/app/${tenantSlug}/deals`);
  return { ok: true };
}

export async function markDealLost(tenantSlug: string, dealId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "deals.edit")) return { ok: false, error: "You don't have permission to edit deals." };

  await prisma.deal.updateMany({
    where: { id: dealId, tenantId: tenant.id },
    data: { status: "LOST" },
  });

  revalidatePath(`/app/${tenantSlug}/deals`);
  return { ok: true };
}

export async function deleteDeal(tenantSlug: string, dealId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "deals.delete")) return { ok: false, error: "You don't have permission to delete deals." };

  await prisma.deal.deleteMany({ where: { id: dealId, tenantId: tenant.id } });
  revalidatePath(`/app/${tenantSlug}/deals`);
  return { ok: true };
}

// ---------- Activities (notes/calls/etc. logged against a deal or contact) ----------

export async function logActivity(
  tenantSlug: string,
  args: { dealId?: string; contactId?: string; type: "NOTE" | "CALL" | "EMAIL" | "MEETING"; content: string }
): Promise<ActionResult> {
  const { tenant, user } = await requireTenantMembership(tenantSlug);
  if (!args.content.trim()) return { ok: false, error: "Activity content can't be empty." };

  await prisma.activity.create({
    data: {
      tenantId: tenant.id,
      dealId: args.dealId,
      contactId: args.contactId,
      type: args.type,
      content: args.content.trim(),
      userId: (user as any).id,
    },
  });

  revalidatePath(`/app/${tenantSlug}/deals`);
  revalidatePath(`/app/${tenantSlug}/contacts`);
  return { ok: true };
}

// ---------- Pipeline stages ----------

export async function createStage(tenantSlug: string, name: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "pipeline.manage")) return { ok: false, error: "Only owners and admins can edit the pipeline." };
  if (!name.trim()) return { ok: false, error: "Stage name can't be empty." };

  const count = await prisma.pipelineStage.count({ where: { tenantId: tenant.id } });
  await prisma.pipelineStage.create({
    data: { tenantId: tenant.id, name: name.trim(), order: count, color: "#3F6659" },
  });

  revalidatePath(`/app/${tenantSlug}/deals`);
  return { ok: true };
}

export async function deleteStage(tenantSlug: string, stageId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "pipeline.manage")) return { ok: false, error: "Only owners and admins can edit the pipeline." };

  const dealsInStage = await prisma.deal.count({ where: { stageId, tenantId: tenant.id } });
  if (dealsInStage > 0) return { ok: false, error: "Move deals out of this stage before deleting it." };

  await prisma.pipelineStage.deleteMany({ where: { id: stageId, tenantId: tenant.id } });
  revalidatePath(`/app/${tenantSlug}/deals`);
  return { ok: true };
}
