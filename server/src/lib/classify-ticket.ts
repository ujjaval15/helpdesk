import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import prisma from "../db";
import { TicketCategory } from "../generated/prisma/enums";
import type { Ticket } from "../generated/prisma/client";
import boss from "./queue";

const validCategories = new Set(Object.values(TicketCategory));

export const CLASSIFY_TICKET_QUEUE = "classify-ticket";

export type ClassifyTicketData = Pick<Ticket, "id" | "subject" | "body">;

export async function enqueueClassifyTicket(ticket: ClassifyTicketData) {
  await boss.send(CLASSIFY_TICKET_QUEUE, ticket);
}

export async function classifyTicketHandler([job]: [{ data: ClassifyTicketData }]) {
  const { id, subject, body } = job.data;

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a ticket classifier. Classify the support ticket into exactly one of these categories: GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST. Return only the category name, nothing else.`,
    prompt: `Subject: ${subject}\n\nBody: ${body}`,
  });

  const category = text.trim();
  if (!validCategories.has(category as TicketCategory)) return;

  await prisma.ticket.update({
    where: { id },
    data: { category: category as TicketCategory },
  });
}
