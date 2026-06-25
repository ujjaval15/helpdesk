import { Router } from "express";
import { z } from "zod";
import { auth } from "../lib/auth";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import prisma from "../db";
import { Role } from "../generated/prisma/enums";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      image: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

const createUserSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    res.status(400).json({ errors });
    return;
  }

  const { name, email, password } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const user = await ctx.internalAdapter.createUser({
    name,
    email: normalizedEmail,
    role: Role.agent,
    emailVerified: false,
  });

  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
