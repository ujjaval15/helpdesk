import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import prisma from "../db";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const isAdmin = req.user!.role === "admin";

  const where = isAdmin ? {} : { assignedAgentId: req.user!.id };

  const tickets = await prisma.ticket.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  res.json({ tickets });
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
