import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { RidgelineHero } from "@/components/marketing/RidgelineGraphic";

const PROOF_POINTS = [
  { stat: "11 min", label: "average time to log a deal, start to finish" },
  { stat: "4 roles", label: "owner, admin, member — no seat spent on guessing access" },
  { stat: "1 API", label: "contacts and deals in, reports out, no side channels" },
];

const WORKFLOW = [
  {
    title: "Bring in a contact",
    body: "Add people and companies as they show up — a form, a CSV, or the API. Ridgeline doesn't ask for fields you don't have yet.",
  },
  {
    title: "Move the deal up the ridge",
    body: "Drag a deal from stage to stage on the pipeline board. The board is the plan — no separate spreadsheet to keep in sync.",
  },
  {
    title: "Read the pipeline, not just the deals",
    body: "Reports roll every open deal into stage totals and win rate, so a manager can see the shape of the quarter at a glance.",
  },
  {
    title: "Bring the team in, safely",
    body: "Invite teammates with a role that matches what they should touch. Owners manage billing; members work deals.",
  },
];

export default function LandingPage() {
  return (
    <div>
      <MarketingNav />

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-20 pt-16 text-center">
        <div className="max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-pine">
            Pipeline CRM
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Every deal is a climb.
            <br />
            See the whole ridgeline.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-lg text-ink-soft">
            Ridgeline is the CRM for teams who'd rather look at a pipeline than a spreadsheet.
            Contacts, deals, and reports, built around the shape of a real sales process.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded bg-ink px-6 py-3 font-medium text-paper transition hover:bg-ink-soft sm:w-auto"
            >
              Start free — no card required
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded border border-hairline px-6 py-3 font-medium text-ink transition hover:border-ink sm:w-auto"
            >
              See pricing
            </Link>
          </div>
        </div>
        <RidgelineHero />
      </section>

      <section className="border-y border-hairline bg-ink py-12 text-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
          {PROOF_POINTS.map((p) => (
            <div key={p.label} className="text-center sm:text-left">
              <div className="font-mono text-3xl font-bold text-gold">{p.stat}</div>
              <div className="mt-1 text-sm text-paper/70">{p.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-lg font-display text-3xl font-bold text-ink">
          One path, four stops, no detours.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
          {WORKFLOW.map((step) => (
            <div key={step.title} className="bg-paper p-8">
              <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-lg bg-pine px-8 py-14 text-center text-paper sm:px-16">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Bring your team up the ridge.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-paper/80">
            Free for small teams. No credit card to start, no surprise limits mid-quarter.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-block rounded bg-gold px-6 py-3 font-medium text-ink transition hover:bg-gold-soft"
          >
            Create your workspace
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
