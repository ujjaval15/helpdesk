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

const updateUserSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id as string;
  const result = updateUserSchema.safeParse(req.body);

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

  const existing = await prisma.user.findUnique({ where: { id: id } });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email: normalizedEmail, id: { not: id } },
  });
  if (emailTaken) {
    res.status(409).json({ error: "A user with this email already exists" });
    return;
  }

  const user = await prisma.user.update({
    where: { id: id },
    data: { name, email: normalizedEmail },
    select: { id: true, name: true, email: true, role: true },
  });

  if (password) {
    const ctx = await auth.$context;
    const hash = await ctx.password.hash(password);
    await prisma.account.updateMany({
      where: { userId: user.id, providerId: "credential" },
      data: { password: hash },
    });
  }

  res.json({ user });
});

export default router;
