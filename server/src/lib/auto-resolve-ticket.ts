import { readFileSync } from "fs";
import { join } from "path";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import prisma from "../db";
import type { Ticket } from "../generated/prisma/client";
import boss from "./queue";

const knowledgeBase = readFileSync(join(import.meta.dir, "../../knowledge-base.md"), "utf-8");

export const AUTO_RESOLVE_TICKET_QUEUE = "auto-resolve-ticket";

export type AutoResolveTicketData = Pick<Ticket, "id" | "subject" | "body" | "customerName" | "customerEmail">;

export async function enqueueAutoResolveTicket(ticket: AutoResolveTicketData) {
  await boss.send(AUTO_RESOLVE_TICKET_QUEUE, ticket);
}

export async function autoResolveTicketHandler([job]: [{ data: AutoResolveTicketData }]) {
  const { id, subject, body, customerName, customerEmail } = job.data;

  const ticket = await prisma.ticket.findUnique({ where: { id }, select: { status: true } });
  if (!ticket || ticket.status !== "NEW") return;

  await prisma.ticket.update({ where: { id }, data: { status: "PROCESSING" } });

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a support agent. Use ONLY the knowledge base below to answer the customer's question. Do not invent information.

KNOWLEDGE BASE:
${knowledgeBase}

ESCALATION RULES — you MUST set canResolve to false if ANY of these apply:
- The user threatens legal action
- The user requests a refund outside the 30-day window
- The user disputes a charge or mentions a chargeback
- The issue involves account security concerns
- You are not confident you can fully resolve this from the knowledge base

Respond in JSON only: { "canResolve": boolean, "reply": string, "confidence": "high" | "medium" | "low" }

If canResolve is true, write a complete, helpful reply to the customer. Address them by first name.
If canResolve is false, set reply to an empty string.`,
    prompt: `From: ${customerName} <${customerEmail}>\nSubject: ${subject}\n\n${body}`,
  });

  let result: { canResolve: boolean; reply: string; confidence: string };
  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    await prisma.ticket.update({ where: { id }, data: { status: "OPEN" } });
    return;
  }

  if (!result.canResolve || result.confidence === "low" || !result.reply) {
    await prisma.ticket.update({ where: { id }, data: { status: "OPEN" } });
    return;
  }

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id },
      data: { status: "RESOLVED" },
    }),
    prisma.reply.create({
      data: {
        body: result.reply,
        senderType: "AGENT",
        senderName: "Support Bot",
        senderEmail: "support@codewithmosh.com",
        ticketId: id,
        userId: null,
      },
    }),
  ]);
}
