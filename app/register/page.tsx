"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field, TextInput, ErrorText } from "@/components/ui/Form";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");

  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (signInRes?.error) {
      setError("Account created — sign in to continue.");
      router.push("/login");
      return;
    }

    const target = plan && plan !== "FREE" ? `?upgrade=${plan}` : "";
    router.push(`/app/${data.slug}/dashboard${target}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          Ridgeline
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Create your workspace</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Free plan, no credit card. Upgrade any time from Settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Your name">
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Company name">
            <TextInput
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="This becomes your workspace"
            />
          </Field>
          <Field label="Work email">
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
              minLength={8}
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
            {loading ? "Creating workspace…" : "Create workspace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
