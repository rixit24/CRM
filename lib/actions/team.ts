"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantMembership } from "@/lib/tenant";
import { can } from "@/lib/rbac";
import { assertWithinLimit, LimitError } from "@/lib/limits";
import { nanoid } from "nanoid";
import type { Role } from "@/lib/rbac";

type ActionResult = { ok: true } | { ok: false; error: string };

// A "seat" is consumed at invite time (not just accept time) so a team
// can't oversell itself by sending more invites than the plan allows.
export async function inviteTeammate(tenantSlug: string, email: string, role: Role): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "team.manage")) return { ok: false, error: "You don't have permission to invite teammates." };

  try {
    await assertWithinLimit(tenant, "seats");
  } catch (e) {
    if (e instanceof LimitError) return { ok: false, error: e.message };
    throw e;
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.includes("@")) return { ok: false, error: "Enter a valid email." };

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: { userId_tenantId: { userId: existingUser.id, tenantId: tenant.id } },
    });
    if (existingMembership) return { ok: false, error: "That person is already on the team." };

    await prisma.membership.create({ data: { userId: existingUser.id, tenantId: tenant.id, role } });
    revalidatePath(`/app/${tenantSlug}/settings/team`);
    return { ok: true };
  }

  await prisma.invite.create({
    data: {
      tenantId: tenant.id,
      email: normalizedEmail,
      role,
      token: nanoid(24),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // In production, send this token as a link via your email provider
  // (Resend, Postmark, SES...). Logged here so the flow is runnable
  // out of the box without email configured.
  console.log(`[invite] ${normalizedEmail} invited to ${tenant.name}. Sign-up link: /register?invite=<token>`);

  revalidatePath(`/app/${tenantSlug}/settings/team`);
  return { ok: true };
}

export async function changeRole(tenantSlug: string, membershipId: string, role: Role): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "team.manage")) return { ok: false, error: "You don't have permission to change roles." };

  const target = await prisma.membership.findFirst({ where: { id: membershipId, tenantId: tenant.id } });
  if (!target) return { ok: false, error: "Member not found." };
  if (target.role === "OWNER") return { ok: false, error: "The workspace owner's role can't be changed here." };

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });
  revalidatePath(`/app/${tenantSlug}/settings/team`);
  return { ok: true };
}

export async function removeMember(tenantSlug: string, membershipId: string): Promise<ActionResult> {
  const { tenant, membership } = await requireTenantMembership(tenantSlug);
  if (!can(membership.role, "team.remove")) return { ok: false, error: "Only the owner can remove teammates." };

  const target = await prisma.membership.findFirst({ where: { id: membershipId, tenantId: tenant.id } });
  if (!target) return { ok: false, error: "Member not found." };
  if (target.role === "OWNER") return { ok: false, error: "The workspace owner can't be removed." };

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath(`/app/${tenantSlug}/settings/team`);
  return { ok: true };
}
