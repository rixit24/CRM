import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  companyName: z.string().min(1).max(100),
});

const DEFAULT_STAGES = [
  { name: "Lead", order: 0, color: "#16203A" },
  { name: "Qualified", order: 1, color: "#3F6659" },
  { name: "Proposal", order: 2, color: "#6E8F82" },
  { name: "Negotiation", order: 3, color: "#D6A244" },
  { name: "Won", order: 4, color: "#D6A244" },
];

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "workspace"}-${nanoid(6)}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, password, companyName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const slug = slugify(companyName);

  const tenant = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email: email.toLowerCase(), passwordHash },
    });

    const tenant = await tx.tenant.create({
      data: {
        name: companyName,
        slug,
        plan: "FREE",
        memberships: { create: { userId: user.id, role: "OWNER" } },
        pipelineStages: { create: DEFAULT_STAGES },
      },
    });

    return tenant;
  });

  return NextResponse.json({ slug: tenant.slug });
}
