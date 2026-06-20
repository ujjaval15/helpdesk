import { auth } from "../src/lib/auth";
import prisma from "../src/db";

enum Role {
  ADMIN = "admin",
  AGENT = "agent",
}

const email = process.env.ADMIN_EMAIL!;
const password = process.env.ADMIN_PASSWORD!;

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}

if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters");
  process.exit(1);
}

async function seed() {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("Admin user already exists, skipping.");
    return;
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const user = await ctx.internalAdapter.createUser({
    name: Role.ADMIN,
    email,
    role: Role.ADMIN,
    emailVerified: false,
  });

  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  console.log(`Admin user created: ${email}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
