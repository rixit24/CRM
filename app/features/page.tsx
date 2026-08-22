import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";

const GROUPS = [
  {
    title: "Pipeline",
    items: [
      ["Drag-and-drop board", "Move deals between stages the same way you'd move sticky notes."],
      ["Custom stages", "Rename, reorder, or add stages to match how your team actually sells."],
      ["Won / lost tracking", "Every closed deal keeps its outcome and close date for reporting."],
    ],
  },
  {
    title: "Contacts",
    items: [
      ["Full contact records", "Name, company, phone, email, and freeform notes in one place."],
      ["Ownership", "Assign a contact or deal to the rep working it."],
      ["Bulk import", "Bring existing contacts in from a CSV in one pass."],
    ],
  },
  {
    title: "Reports",
    items: [
      ["Pipeline value by stage", "See where revenue is sitting right now, not last week."],
      ["Win rate", "Won vs. lost, calculated from your actual closed deals."],
      ["Activity feed", "Every note, call, and meeting logged against a deal or contact."],
    ],
  },
  {
    title: "Team & access",
    items: [
      ["Roles", "Owner, admin, and member — each with a different edit and billing footprint."],
      ["Invites", "Add teammates by email; they land straight in the workspace."],
      ["Per-seat limits", "Your plan's seat cap is enforced automatically, no surprise overages."],
    ],
  },
  {
    title: "Platform",
    items: [
      ["REST API", "Read and write contacts and deals from your own tools (Pro and up)."],
      ["CSV / JSON export", "Take your data with you, any time, on every plan."],
      ["Custom branding", "Swap in your logo and brand color for a workspace that feels like yours (Pro and up)."],
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <MarketingNav />
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-pine">Features</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">
          Built around the pipeline, not around a database.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          Everything below ships on every workspace; plan limits control how much you can hold,
          not what you can do.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-display text-lg font-bold text-ink">{group.title}</h2>
              <ul className="mt-4 space-y-4 border-l border-hairline pl-5">
                {group.items.map(([title, body]) => (
                  <li key={title}>
                    <div className="font-medium text-ink">{title}</div>
                    <div className="mt-0.5 text-sm text-ink-soft">{body}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
        <Link
          href="/register"
          className="inline-block rounded bg-ink px-6 py-3 font-medium text-paper transition hover:bg-ink-soft"
        >
          Start free
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
