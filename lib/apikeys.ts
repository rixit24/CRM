import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

/**
 * Generates a new API key for a tenant. Keys are shown to the user ONCE at
 * creation time — store it now, verify later. In production you'd hash
 * this before storing (like a password) and compare hashes; kept as
 * plaintext here to keep the scaffold's data model simple, but that's the
 * first thing to change before going live.
 */
export function generateApiKey(): string {
  return `crm_live_${nanoid(32)}`;
}

export async function verifyApiKey(key: string) {
  if (!key?.startsWith("crm_live_")) return null;

  const record = await prisma.apiKey.findUnique({
    where: { key },
    include: { tenant: true },
  });

  if (!record || record.revoked || record.tenant.suspended) return null;

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return record;
}
