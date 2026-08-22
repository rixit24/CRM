"use client";

import { useState } from "react";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import clsx from "clsx";

export function BillingPanel({
  tenantSlug,
  currentPlan,
  hasStripeCustomer,
  isOwner,
}: {
  tenantSlug: string;
  currentPlan: string;
  hasStripeCustomer: boolean;
  isOwner: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function upgrade(plan: PlanId) {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug, plan }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "Couldn't start checkout.");
  }

  async function openPortal() {
    setLoading("portal");
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) window.location.href = data.url;
    else alert(data.error ?? "Couldn't open billing portal.");
  }

  return (
    <div className="space-y-6">
      {isOwner && hasStripeCustomer && (
        <button
          onClick={openPortal}
          disabled={loading === "portal"}
          className="rounded border border-hairline px-4 py-2 text-sm font-medium text-ink hover:border-ink disabled:opacity-50"
        >
          {loading === "portal" ? "Opening…" : "Manage payment method & invoices"}
        </button>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          return (
            <div
              key={id}
              className={clsx(
                "rounded-lg border p-5",
                isCurrent ? "border-ink bg-white" : "border-hairline bg-white"
              )}
            >
              <div className="font-display font-bold text-ink">{plan.name}</div>
              <div className="mt-1 font-mono text-lg text-ink">
                {plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}/mo`}
              </div>
              {isCurrent ? (
                <div className="mt-4 rounded bg-paper px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Current plan
                </div>
              ) : isOwner && plan.monthlyPrice > 0 ? (
                <button
                  onClick={() => upgrade(id)}
                  disabled={loading === id}
                  className="mt-4 w-full rounded bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-50"
                >
                  {loading === id ? "Redirecting…" : `Switch to ${plan.name}`}
                </button>
              ) : !isOwner ? (
                <div className="mt-4 text-center text-xs text-ink-soft">Owner only</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
