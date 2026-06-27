import { Router } from "express";
import { z } from "zod";
import prisma from "../db";
import { requireWebhookSecret } from "../middleware/requireWebhookSecret";

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
  const result = inboundEmailSchema.safeParse(req.body);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    res.status(400).json({ errors });
    return;
  }

  const { from, fromName, subject, body } = result.data;
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

  res.status(201).json({ ticket: { id: ticket.id } });
});

export default router;
