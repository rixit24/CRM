import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { can } from "@/lib/rbac";

// Sends the workspace owner to Stripe's hosted billing portal, where they
// can update payment method, download invoices, or cancel — Stripe
// handles all of that UI so we don't have to build it.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tenantSlug } = await req.json();
  const userId = (session.user as any).id as string;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account yet." }, { status: 400 });
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId: tenant.id } },
  });
  if (!membership || !can(membership.role, "billing.manage")) {
    return NextResponse.json({ error: "Only the workspace owner can manage billing." }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${appUrl}/app/${tenantSlug}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
