import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

// GET /api/export?tenant=slug&resource=contacts|deals&format=csv|json
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tenantSlug = searchParams.get("tenant");
  const resource = searchParams.get("resource");
  const format = searchParams.get("format") ?? "csv";

  const userId = (session.user as any).id as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug ?? "" } });
  if (!tenant) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId, tenantId: tenant.id } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let rows: Record<string, unknown>[] = [];
  if (resource === "contacts") {
    const contacts = await prisma.contact.findMany({ where: { tenantId: tenant.id } });
    rows = contacts.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
    }));
  } else if (resource === "deals") {
    const deals = await prisma.deal.findMany({ where: { tenantId: tenant.id }, include: { stage: true } });
    rows = deals.map((d) => ({
      id: d.id,
      title: d.title,
      value: d.value,
      stage: d.stage.name,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    }));
  } else {
    return NextResponse.json({ error: "resource must be `contacts` or `deals`" }, { status: 400 });
  }

  if (format === "json") {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${resource}.json"`,
      },
    });
  }

  const csv = Papa.unparse(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${resource}.csv"`,
    },
  });
}
