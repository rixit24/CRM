import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apikeys";
import { assertWithinLimit, LimitError } from "@/lib/limits";

// Public REST API — the "API access" feature gated to Pro/Enterprise.
// Auth: `Authorization: Bearer crm_live_...` (see Settings → API in the app).
async function authenticate(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!key) return null;
  return verifyApiKey(key);
}

export async function GET(req: Request) {
  const keyRecord = await authenticate(req);
  if (!keyRecord) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { tenantId: keyRecord.tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: contacts });
}

export async function POST(req: Request) {
  const keyRecord = await authenticate(req);
  if (!keyRecord) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  try {
    await assertWithinLimit(keyRecord.tenant, "contacts");
  } catch (e) {
    if (e instanceof LimitError) return NextResponse.json({ error: e.message }, { status: 402 });
    throw e;
  }

  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "`name` is required" }, { status: 400 });

  const contact = await prisma.contact.create({
    data: {
      tenantId: keyRecord.tenantId,
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      company: body.company ?? null,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ data: contact }, { status: 201 });
}
