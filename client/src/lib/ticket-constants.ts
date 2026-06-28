import { z } from "zod";

export const TicketStatus = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketCategory = {
  GENERAL_QUESTION: "GENERAL_QUESTION",
  TECHNICAL_QUESTION: "TECHNICAL_QUESTION",
  REFUND_REQUEST: "REFUND_REQUEST",
} as const;

export type TicketCategory =
  (typeof TicketCategory)[keyof typeof TicketCategory];

export type SenderType = "AGENT" | "CUSTOMER";

export const statusLabel: Record<TicketStatus, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const categoryLabel: Record<TicketCategory, string> = {
  GENERAL_QUESTION: "General Question",
  TECHNICAL_QUESTION: "Technical Question",
  REFUND_REQUEST: "Refund Request",
};

export const statusVariant: Record<
  TicketStatus,
  "destructive" | "default" | "secondary"
> = {
  OPEN: "destructive",
  RESOLVED: "default",
  CLOSED: "secondary",
};

export const senderTypeLabel: Record<SenderType, string> = {
  AGENT: "Agent",
  CUSTOMER: "Customer",
};

export const senderTypeVariant: Record<SenderType, "default" | "secondary"> = {
  AGENT: "default",
  CUSTOMER: "secondary",
};

export const replySchema = z.object({
  body: z.string().min(1, "Reply cannot be empty"),
});

export type ReplyFormData = z.infer<typeof replySchema>;

export const NONE = "NONE";
export const UNASSIGNED = "UNASSIGNED";

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TicketDetail {
  id: number;
  subject: string;
  body: string;
  status: TicketStatus;
  category: TicketCategory | null;
  customerEmail: string;
  customerName: string;
  assignedAgent: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: number;
  body: string;
  senderType: SenderType;
  senderName: string;
  senderEmail: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  category: TicketCategory | null;
  customerEmail: string;
  customerName: string;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
