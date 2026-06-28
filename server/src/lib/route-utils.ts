import type { Response } from "express";
import type { ZodSchema, ZodError } from "zod";
import prisma from "../db";

export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    errors[issue.path[0] as string] = issue.message;
  }
  return errors;
}

export function validateBody<T>(
  schema: ZodSchema<T>,
  body: unknown,
  res: Response,
): T | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ errors: formatZodErrors(result.error) });
    return null;
  }
  return result.data;
}

export function parseIntId(raw: string, res: Response): number | null {
  const id = Number(raw);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return null;
  }
  return id;
}

export async function findTicketWithAccess(
  id: number,
  userId: string,
  isAdmin: boolean,
  res: Response,
) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return null;
  }

  if (!isAdmin && ticket.assignedAgentId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }

  return ticket;
}
