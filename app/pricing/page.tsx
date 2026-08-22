import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import clsx from "clsx";

export default function PricingPage() {
  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-pine">Pricing</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">
          Priced for the team you have.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          Every plan includes the full pipeline board and reports. Higher plans lift the seat
          and record caps, and unlock the API and custom branding.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isPro = id === "PRO";
          return (
            <div
              key={id}
              className={clsx(
                "flex flex-col rounded-lg border p-8",
                isPro ? "border-ink bg-ink text-paper" : "border-hairline bg-white"
              )}
            >
              {isPro && (
                <span className="mb-3 inline-block w-fit rounded-full bg-gold px-3 py-1 font-mono text-xs font-semibold text-ink">
                  MOST POPULAR
                </span>
              )}
              <h2 className="font-display text-xl font-bold">{plan.name}</h2>
              <p className={clsx("mt-1 text-sm", isPro ? "text-paper/70" : "text-ink-soft")}>
                {plan.tagline}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">
                  {plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}`}
                </span>
                {plan.monthlyPrice > 0 && (
                  <span className={clsx("text-sm", isPro ? "text-paper/70" : "text-ink-soft")}>
                    /month
                  </span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className={isPro ? "text-gold" : "text-pine"}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?plan=${id}`}
                className={clsx(
                  "mt-8 block rounded px-5 py-3 text-center font-medium transition",
                  isPro
                    ? "bg-gold text-ink hover:bg-gold-soft"
                    : "bg-ink text-paper hover:bg-ink-soft"
                )}
              >
                {id === "FREE" ? "Start free" : "Choose " + plan.name}
              </Link>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="font-display text-2xl font-bold text-ink">Questions</h2>
        <dl className="mt-6 space-y-6">
          <div>
            <dt className="font-medium text-ink">Can I change plans later?</dt>
            <dd className="mt-1 text-sm text-ink-soft">
              Yes — upgrade or downgrade any time from Settings → Billing. Changes prorate
              through Stripe automatically.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">What happens if I hit a plan limit?</dt>
            <dd className="mt-1 text-sm text-ink-soft">
              You'll see a clear message telling you which limit you hit and a link to upgrade.
              Nothing you've already saved is ever deleted or locked.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Is there a contract?</dt>
            <dd className="mt-1 text-sm text-ink-soft">
              No. Every paid plan is month-to-month and cancels instantly from Settings →
              Billing.
            </dd>
          </div>
        </dl>
      </section>

      <MarketingFooter />
    </div>
  );
}
