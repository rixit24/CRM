import { nanoid } from "nanoid";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Generates a new API key for a tenant. The raw key is shown to the user
 * ONCE at creation time — only its hash is ever stored, the same way a
 * password would be. If the database is ever read directly or leaked, raw
 * keys are never exposed.
 */
export function generateApiKey(): string {
  return `crm_live_${nanoid(32)}`;
}

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export async function verifyApiKey(rawKey: string) {
  if (!rawKey?.startsWith("crm_live_")) return null;

  const hashed = hashApiKey(rawKey);
  const record = await prisma.apiKey.findUnique({
    where: { key: hashed },
    include: { tenant: true },
  });

  if (!record || record.revoked || record.tenant.suspended) return null;

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return record;
}