"use client";

import { useState } from "react";
import { createApiKey, revokeApiKey } from "@/lib/actions/settings";

type Key = { id: string; name: string; key: string; revoked: boolean; createdAt: string };

export function ApiKeyManager({ tenantSlug, initialKeys }: { tenantSlug: string; initialKeys: Key[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    const res = await createApiKey(tenantSlug, name || "Untitled key");
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNewKey(res.key ?? null);
    setName("");
    setKeys((prev) => [
      { id: crypto.randomUUID(), name: name || "Untitled key", key: res.key!, revoked: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  async function handleRevoke(id: string) {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
    await revokeApiKey(tenantSlug, id);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-hairline bg-white p-6">
        <h2 className="font-display font-bold text-ink">Create a key</h2>
        <div className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Zapier integration"
            className="flex-1 rounded border border-hairline px-3 py-2 text-sm"
          />
          <button
            onClick={handleCreate}
            className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
          >
            Generate key
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {newKey && (
          <div className="mt-4 rounded border border-gold bg-gold/10 p-3 text-sm">
            <p className="font-medium text-ink">Copy this now — it won't be shown again.</p>
            <code className="mt-1 block break-all font-mono text-xs text-ink">{newKey}</code>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-hairline last:border-0">
                <td className="px-5 py-3 text-ink">{k.name}</td>
                <td className="px-5 py-3">
                  <span className={k.revoked ? "text-ink-soft" : "text-pine"}>
                    {k.revoked ? "Revoked" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {!k.revoked && (
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-xs text-ink-soft hover:text-red-600"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-ink-soft">
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
