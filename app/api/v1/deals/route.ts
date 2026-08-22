import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apikeys";
import { assertWithinLimit, LimitError } from "@/lib/limits";

async function authenticate(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!key) return null;
  return verifyApiKey(key);
}

export async function GET(req: Request) {
  const keyRecord = await authenticate(req);
  if (!keyRecord) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  const deals = await prisma.deal.findMany({
    where: { tenantId: keyRecord.tenantId },
    include: { stage: true, contact: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: deals });
}

export async function POST(req: Request) {
  const keyRecord = await authenticate(req);
  if (!keyRecord) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  try {
    await assertWithinLimit(keyRecord.tenant, "deals");
  } catch (e) {
    if (e instanceof LimitError) return NextResponse.json({ error: e.message }, { status: 402 });
    throw e;
  }

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.stageId) {
    return NextResponse.json({ error: "`title` and `stageId` are required" }, { status: 400 });
  }

  const stage = await prisma.pipelineStage.findFirst({
    where: { id: body.stageId, tenantId: keyRecord.tenantId },
  });
  if (!stage) return NextResponse.json({ error: "Invalid stageId" }, { status: 400 });

  const deal = await prisma.deal.create({
    data: {
      tenantId: keyRecord.tenantId,
      title: body.title,
      value: Number(body.value) || 0,
      stageId: body.stageId,
      contactId: body.contactId ?? null,
    },
  });

  return NextResponse.json({ data: deal }, { status: 201 });
}
