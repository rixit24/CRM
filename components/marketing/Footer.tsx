import Link from "next/link";
import { RidgelineDivider } from "./RidgelineGraphic";

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline">
      <RidgelineDivider />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="font-display font-bold text-ink">Ridgeline</div>
        <nav className="flex flex-wrap gap-6">
          <Link href="/features" className="hover:text-ink">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-ink">
            Start free
          </Link>
        </nav>
        <div>© {new Date().getFullYear()} Ridgeline CRM</div>
      </div>
    </footer>
  );
}
