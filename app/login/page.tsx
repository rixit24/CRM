"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextInput, ErrorText } from "@/components/ui/Form";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("That email and password don't match an account.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          Ridgeline
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Sign in</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Email">
            <TextInput
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Password">
            <TextInput
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          <ErrorText>{error}</ErrorText>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-ink px-4 py-3 font-medium text-paper transition hover:bg-ink-soft disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Need a workspace?{" "}
          <Link href="/register" className="font-medium text-ink underline">
            Start free
          </Link>
        </p>
      </div>
    </div>
  );
}
