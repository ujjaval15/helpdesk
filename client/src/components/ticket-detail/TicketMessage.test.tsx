import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../test/render";
import TicketMessage from "./TicketMessage";
import type { TicketDetail } from "@/lib/ticket-constants";

const mockTicket: TicketDetail = {
  id: 1,
  subject: "Cannot log in",
  body: "I get a 500 error when trying to sign in.",
  status: "OPEN",
  category: "TECHNICAL_QUESTION",
  customerEmail: "jane@example.com",
  customerName: "Jane Doe",
  assignedAgent: null,
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z",
};

describe("TicketMessage", () => {
  it("renders the customer name", () => {
    renderWithProviders(<TicketMessage ticket={mockTicket} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders the customer email", () => {
    renderWithProviders(<TicketMessage ticket={mockTicket} />);
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
  });

  it("renders the ticket body", () => {
    renderWithProviders(<TicketMessage ticket={mockTicket} />);
    expect(
      screen.getByText("I get a 500 error when trying to sign in."),
    ).toBeInTheDocument();
  });

  it("renders the creation date", () => {
    renderWithProviders(<TicketMessage ticket={mockTicket} />);
    expect(
      screen.getByText(new Date(mockTicket.createdAt).toLocaleString()),
    ).toBeInTheDocument();
  });

  it("preserves whitespace in body text", () => {
    const ticket = { ...mockTicket, body: "Line 1\nLine 2" };
    renderWithProviders(<TicketMessage ticket={ticket} />);
    const body = screen.getByText((_content, element) =>
      element?.textContent === "Line 1\nLine 2" && element.tagName === "P",
    );
    expect(body.className).toContain("whitespace-pre-wrap");
  });
});
