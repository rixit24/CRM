import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          Ridgeline
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <Link href="/features" className="hover:text-ink">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/login" className="hidden text-ink-soft hover:text-ink sm:block">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded bg-ink px-4 py-2 text-paper transition hover:bg-ink-soft"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
