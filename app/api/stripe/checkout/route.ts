import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { PLANS, type PlanId } from "@/lib/plans";
import { can } from "@/lib/rbac";

// Starts a Stripe Checkout session to move a tenant onto a paid plan.
// Only the workspace owner can touch billing (see lib/rbac.ts).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tenantSlug, plan } = await req.json();
  const planDef = PLANS[plan as PlanId];
  if (!planDef || !planDef.stripePriceId) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const userId = (session.user as any).id as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });

  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId: tenant.id } },
  });
  if (!membership || !can(membership.role, "billing.manage")) {
    return NextResponse.json({ error: "Only the workspace owner can manage billing." }, { status: 403 });
  }

  let customerId = tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: tenant.name,
      metadata: { tenantId: tenant.id },
    });
    customerId = customer.id;
    await prisma.tenant.update({ where: { id: tenant.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planDef.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/app/${tenantSlug}/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/app/${tenantSlug}/settings/billing?checkout=cancelled`,
    metadata: { tenantId: tenant.id, plan: planDef.id },
    subscription_data: { metadata: { tenantId: tenant.id, plan: planDef.id } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
