import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SUPERADMIN_EMAIL ?? "you@yourcompany.com").toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD ?? "change-me-now";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.isSuperAdmin) {
      await prisma.user.update({ where: { id: existing.id }, data: { isSuperAdmin: true } });
    }
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, name: "Admin", isSuperAdmin: true },
  });

  console.log(`Created super admin: ${email} / ${password}`);
  console.log("Sign in at /login, then visit /admin.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
