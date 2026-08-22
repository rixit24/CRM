// Central definition of what each plan includes and costs.
// This is the single source of truth used by:
//  - the pricing page (marketing)
//  - the billing/checkout flow (Stripe)
//  - server-side usage-limit enforcement (lib/limits.ts)
// SQLite has no enum type, so Tenant.plan is a plain String column in the
// schema (see prisma/schema.prisma) — this union is the app-level source
// of truth for which values are valid.
export type PlanId = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number; // in USD, 0 = free
  stripePriceId: string | undefined; // set via env, undefined for FREE
  limits: {
    seats: number; // max team members
    contacts: number; // max contacts, Infinity = unlimited
    deals: number;
    apiAccess: boolean;
    customBranding: boolean;
    exportData: boolean;
  };
  features: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Free",
    tagline: "Try the full pipeline with a small team.",
    monthlyPrice: 0,
    stripePriceId: undefined,
    limits: {
      seats: 2,
      contacts: 100,
      deals: 50,
      apiAccess: false,
      customBranding: false,
      exportData: true,
    },
    features: [
      "Up to 2 team members",
      "100 contacts, 50 deals",
      "Pipeline board & basic reports",
      "CSV / JSON export",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    tagline: "For growing teams that live in their pipeline.",
    monthlyPrice: 49,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    limits: {
      seats: 10,
      contacts: 10_000,
      deals: 5_000,
      apiAccess: true,
      customBranding: true,
      exportData: true,
    },
    features: [
      "Up to 10 team members",
      "10,000 contacts, 5,000 deals",
      "Role-based access control",
      "API access",
      "Custom branding",
      "CSV / JSON export",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    tagline: "Unlimited scale, priority support, and control.",
    monthlyPrice: 199,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
    limits: {
      seats: Infinity,
      contacts: Infinity,
      deals: Infinity,
      apiAccess: true,
      customBranding: true,
      exportData: true,
    },
    features: [
      "Unlimited team members",
      "Unlimited contacts & deals",
      "Role-based access control",
      "API access with higher rate limits",
      "Custom branding",
      "Priority support",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["FREE", "PRO", "ENTERPRISE"];

export function planAtLeast(current: PlanId, required: PlanId): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}
