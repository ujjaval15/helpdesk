import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import prisma from "../db";
import { TicketStatus, TicketCategory } from "../generated/prisma/enums";

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
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

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

export default router;
