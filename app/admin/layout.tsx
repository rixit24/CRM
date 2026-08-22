import { requireSuperAdmin } from "@/lib/tenant";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hairline bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-display font-bold">
            Ridgeline · Admin
          </Link>
          <Link href="/dashboard" className="text-sm text-paper/70 hover:text-paper">
            Exit admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
