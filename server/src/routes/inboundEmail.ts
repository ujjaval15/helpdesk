import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { requireWebhookSecret } from "../middleware/requireWebhookSecret";
import { validateBody } from "../lib/route-utils";
import { classifyTicket } from "../lib/classify-ticket";

const router = Router();

export const inboundEmailSchema = z.object({
  from: z.string().email("Invalid sender email"),
  fromName: z.string().trim().min(1, "Sender name is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  body: z.string().trim().min(1, "Body is required"),
});

export function normalizeSubject(subject: string): string {
  return subject.replace(/\s+/g, " ");
}

router.post("/", requireWebhookSecret, async (req, res) => {
  const data = validateBody(inboundEmailSchema, req.body, res);
  if (!data) return;

  const { from, fromName, subject, body } = data;
  const customerEmail = from.toLowerCase().trim();
  const normalizedSubject = normalizeSubject(subject);

  const existingTicket = await prisma.ticket.findFirst({
    where: {
      customerEmail,
      subject: normalizedSubject,
      status: "OPEN",
    },
    select: { id: true },
  });

  if (existingTicket) {
    res
      .status(200)
      .json({ ticket: { id: existingTicket.id }, existing: true });
    return;
  }

  const ticket = await prisma.ticket.create({
    data: {
      subject: normalizedSubject,
      body,
      customerEmail,
      customerName: fromName,
    },
  });

  classifyTicket(ticket);

  res.status(201).json({ ticket: { id: ticket.id } });
});

export default router;
