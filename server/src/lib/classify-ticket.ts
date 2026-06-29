import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import prisma from "../db";
import { TicketCategory } from "../generated/prisma/enums";
import type { Ticket } from "../generated/prisma/client";

const validCategories = new Set(Object.values(TicketCategory));

export async function classifyTicket(ticket: Pick<Ticket, "id" | "subject" | "body">) {
  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: `You are a ticket classifier. Classify the support ticket into exactly one of these categories: GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST. Return only the category name, nothing else.`,
      prompt: `Subject: ${ticket.subject}\n\nBody: ${ticket.body}`,
    });

    const category = text.trim();
    if (!validCategories.has(category as TicketCategory)) return;

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { category: category as TicketCategory },
    });
  } catch (error) {
    console.error(`Failed to classify ticket ${ticket.id}:`, error);
  }
}
