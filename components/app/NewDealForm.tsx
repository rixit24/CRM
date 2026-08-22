"use client";

import { useState } from "react";
import { createDeal } from "@/lib/actions/crm";

export function NewDealForm({
  tenantSlug,
  stages,
  contacts,
}: {
  tenantSlug: string;
  stages: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const res = await createDeal(tenantSlug, formData);
    if (!res.ok) {
      setError(res.error);
    } else {
      setError(null);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
      >
        New deal
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-hairline bg-white p-5 shadow-sm sm:absolute sm:right-8 sm:top-20 sm:z-10">
      <form action={handleSubmit} className="space-y-3">
        <input
          name="title"
          required
          placeholder="Deal title"
          className="w-full rounded border border-hairline px-3 py-2 text-sm"
        />
        <input
          name="value"
          type="number"
          min="0"
          step="1"
          placeholder="Value ($)"
          className="w-full rounded border border-hairline px-3 py-2 text-sm"
        />
        <select name="stageId" required className="w-full rounded border border-hairline px-3 py-2 text-sm">
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="contactId" className="w-full rounded border border-hairline px-3 py-2 text-sm">
          <option value="">No contact</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button className="flex-1 rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft">
            Create
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-hairline px-4 py-2 text-sm text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
