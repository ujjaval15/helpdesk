import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import prisma from "../db";
import { TicketStatus, TicketCategory, Role, SenderType } from "../generated/prisma/enums";
import { validateBody, parseIntId, findTicketWithAccess } from "../lib/route-utils";

const router = Router();

const validStatuses = new Set(Object.values(TicketStatus));
const validCategories = new Set(Object.values(TicketCategory));
const sortableFields = new Set(["id", "subject", "status", "category", "customerName", "createdAt"]);

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

router.get("/", requireAuth, async (req, res) => {
  const isAdmin = req.user!.role === "admin";
  const { status, category, sortBy, sortOrder } = req.query;

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

  const where: Record<string, unknown> = isAdmin
    ? {}
    : { assignedAgentId: req.user!.id };

  if (typeof status === "string" && validStatuses.has(status as TicketStatus)) {
    where.status = status;
  }

  if (typeof category === "string" && validCategories.has(category as TicketCategory)) {
    where.category = category;
  }

  const orderField = typeof sortBy === "string" && sortableFields.has(sortBy) ? sortBy : "createdAt";
  const orderDir = sortOrder === "asc" ? "asc" : "desc";

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      select: {
        id: true,
        subject: true,
        status: true,
        category: true,
        customerEmail: true,
        customerName: true,
        assignedAgentId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { [orderField]: orderDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseIntId(req.params.id, res);
  if (id === null) return;

  const isAdmin = req.user!.role === "admin";

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignedAgent: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (!isAdmin && ticket.assignedAgentId !== req.user!.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json({ ticket });
});

export const updateTicketSchema = z.object({
  assignedAgentId: z.string().min(1).nullable().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  category: z.nativeEnum(TicketCategory).nullable().optional(),
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseIntId(req.params.id, res);
  if (id === null) return;

  const data = validateBody(updateTicketSchema, req.body, res);
  if (!data) return;

  const { assignedAgentId, status, category } = data;
  const isAdmin = req.user!.role === "admin";

  if (assignedAgentId !== undefined && !isAdmin) {
    res.status(403).json({ error: "Only admins can assign agents" });
    return;
  }

  const ticket = await findTicketWithAccess(id, req.user!.id, isAdmin, res);
  if (!ticket) return;

  if (assignedAgentId) {
    const agent = await prisma.user.findFirst({
      where: { id: assignedAgentId, deletedAt: null, role: Role.agent },
    });

    if (!agent) {
      res.status(400).json({ error: "Agent not found" });
      return;
    }
  }

  const updateData: Record<string, unknown> = {};
  if (assignedAgentId !== undefined) updateData.assignedAgentId = assignedAgentId;
  if (status !== undefined) updateData.status = status;
  if (category !== undefined) updateData.category = category;

  const updated = await prisma.ticket.update({
    where: { id },
    data: updateData,
    include: {
      assignedAgent: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json({ ticket: updated });
});

const createReplySchema = z.object({
  body: z.string().min(1).max(5000),
});

router.get("/:id/replies", requireAuth, async (req, res) => {
  const id = parseIntId(req.params.id, res);
  if (id === null) return;

  const ticket = await findTicketWithAccess(id, req.user!.id, req.user!.role === "admin", res);
  if (!ticket) return;

  const replies = await prisma.reply.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: "asc" },
  });

  res.json({ replies });
});

router.post("/:id/replies", requireAuth, async (req, res) => {
  const id = parseIntId(req.params.id, res);
  if (id === null) return;

  const data = validateBody(createReplySchema, req.body, res);
  if (!data) return;

  const ticket = await findTicketWithAccess(id, req.user!.id, req.user!.role === "admin", res);
  if (!ticket) return;

  const reply = await prisma.reply.create({
    data: {
      body: data.body,
      senderType: SenderType.AGENT,
      senderName: req.user!.name,
      senderEmail: req.user!.email,
      ticketId: id,
      userId: req.user!.id,
    },
  });

  res.status(201).json({ reply });
});

export { createReplySchema };
export default router;
