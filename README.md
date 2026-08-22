# Ridgeline CRM

A multi-tenant SaaS CRM scaffold: contacts, deal pipeline, reports, team
roles, Stripe subscription billing, a public REST API, data export, custom
branding, and a super-admin dashboard for you (the vendor) to manage
customers. Marketing site included (landing, pricing, features).

This is a solid, working foundation, not a hardened production app — see
"Before you charge real customers" at the bottom before you launch.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Prisma + SQLite for local dev (swap to Postgres for production — one line)
- NextAuth (credentials/email+password) with JWT sessions
- Stripe Checkout + Billing Portal + webhooks for subscriptions
- Server actions for CRUD (no separate internal API layer to maintain)
- A public `/api/v1` REST API, key-authenticated, for the Pro/Enterprise "API access" feature

## Multi-tenancy model

Every CRM record (`Contact`, `Deal`, `PipelineStage`, `Activity`, `ApiKey`)
has a `tenantId`. A `User` can belong to multiple tenants via `Membership`
(with a `role`: OWNER / ADMIN / MEMBER). Every server action and page under
`/app/[tenant]/...` calls `requireTenantMembership(slug)`
(`lib/tenant.ts`) first — that's the single isolation checkpoint: no
membership record, no access, full stop. Add new server actions by
following that same pattern.

## Getting started

```bash
npm install
cp .env.example .env       # fill in values, see below
npm run db:push            # creates dev.db (SQLite) from the schema
npm run db:seed            # creates your super-admin login
npm run dev
```

Open http://localhost:3000. Sign in at `/login` with the email/password
from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` in `.env`, then visit
`/admin` — that's your customer-management dashboard. To try it as a
customer would, register a separate account at `/register`.

## Stripe setup

1. Create two recurring Products/Prices in the Stripe Dashboard (Pro,
   Enterprise) and put their price IDs in `STRIPE_PRICE_PRO` /
   `STRIPE_PRICE_ENTERPRISE`.
2. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   locally (Stripe CLI) and put the printed signing secret in
   `STRIPE_WEBHOOK_SECRET`. In production, create a webhook endpoint in
   the Dashboard pointed at `https://yourdomain.com/api/stripe/webhook`
   listening for `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, and
   `invoice.payment_failed`.
3. The webhook (`app/api/stripe/webhook/route.ts`) is the only place plan
   state gets written — never trust a client call to "you're upgraded now."

## Plan limits

Everything about what each plan includes lives in one file:
`lib/plans.ts`. Seat/contact/deal caps are enforced in `lib/limits.ts`,
called from the relevant server actions before a create succeeds.
Change a limit or add a plan there and it flows through pricing page,
enforcement, and the billing UI automatically.

## Project layout

```
app/
  page.tsx, pricing/, features/        marketing site
  login/, register/                    auth
  dashboard/                           post-login workspace picker
  app/[tenant]/                        the CRM itself (tenant-scoped)
    dashboard/ contacts/ deals/ reports/
    settings/team/ settings/branding/ settings/api/ settings/billing/
  admin/                               super-admin (you), gated by isSuperAdmin
  api/
    auth/[...nextauth]                 NextAuth
    register                           account + tenant creation
    stripe/checkout, portal, webhook   billing
    v1/contacts, v1/deals              public REST API (API-key auth)
    export                             CSV/JSON export
lib/
  auth.ts, tenant.ts, rbac.ts, limits.ts, plans.ts, stripe.ts, apikeys.ts
  actions/                             server actions (crm, team, settings, admin)
prisma/schema.prisma                   data model
```

## Before you charge real customers

This scaffold gets the architecture right but intentionally leaves some
things for you to finish:

- **API keys are stored in plaintext** in the database (`lib/apikeys.ts`
  says so at the top). Hash them like passwords before going live.
- **No transactional email** is wired up — invite links are only
  `console.log`'d. Add Resend/Postmark/SES for invites and receipts.
- **No rate limiting** on the public API or auth routes — add one
  (Upstash, Vercel's built-in, or middleware-level) before you publicize
  API access.
- **Switch SQLite → Postgres** for production (`prisma/schema.prisma`,
  change `provider` to `"postgresql"` and point `DATABASE_URL` at a real
  database — Supabase, Neon, RDS all work).
- **Add automated tests** around billing state transitions and the RBAC
  matrix (`lib/rbac.ts`) before you rely on them.
- Review Stripe's [webhook best practices](https://stripe.com/docs/webhooks/best-practices)
  for idempotency — this scaffold processes events but doesn't dedupe
  retried webhook deliveries.
