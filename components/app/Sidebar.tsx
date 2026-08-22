"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const NAV = [
  { href: "dashboard", label: "Overview" },
  { href: "contacts", label: "Contacts" },
  { href: "deals", label: "Pipeline" },
  { href: "reports", label: "Reports" },
];

const SETTINGS_NAV = [
  { href: "settings/team", label: "Team" },
  { href: "settings/branding", label: "Branding" },
  { href: "settings/api", label: "API" },
  { href: "settings/billing", label: "Billing" },
];

export function Sidebar({
  tenantSlug,
  tenantName,
  role,
  plan,
}: {
  tenantSlug: string;
  tenantName: string;
  role: string;
  plan: string;
}) {
  const pathname = usePathname();
  const base = `/app/${tenantSlug}`;

  function isActive(href: string) {
    return pathname === `${base}/${href}` || pathname.startsWith(`${base}/${href}/`);
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-hairline bg-white">
      <div className="border-b border-hairline px-5 py-5">
        <Link href={base + "/dashboard"} className="font-display text-base font-bold text-ink">
          {tenantName}
        </Link>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
          {plan} plan · {role.toLowerCase()}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={`${base}/${item.href}`}
                className={clsx(
                  "block rounded px-3 py-2 text-sm font-medium",
                  isActive(item.href) ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
          Settings
        </div>
        <ul className="mt-2 space-y-1">
          {SETTINGS_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={`${base}/${item.href}`}
                className={clsx(
                  "block rounded px-3 py-2 text-sm font-medium",
                  isActive(item.href) ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-hairline p-3">
        <Link href="/dashboard" className="block rounded px-3 py-2 text-sm text-ink-soft hover:bg-paper hover:text-ink">
          Switch workspace
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="block w-full rounded px-3 py-2 text-left text-sm text-ink-soft hover:bg-paper hover:text-ink"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
