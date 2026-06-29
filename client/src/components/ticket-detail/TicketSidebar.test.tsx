import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders } from "../../test/render";
import TicketSidebar from "./TicketSidebar";
import type { TicketDetail, Agent } from "@/lib/ticket-constants";

const mockTicket: TicketDetail = {
  id: 1,
  subject: "Cannot log in",
  body: "I get a 500 error.",
  status: "OPEN",
  category: "TECHNICAL_QUESTION",
  customerEmail: "jane@example.com",
  customerName: "Jane Doe",
  assignedAgent: null,
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T12:00:00.000Z",
};

const mockAgents: Agent[] = [
  { id: "agent-1", name: "Bob Agent", email: "bob@example.com", role: "agent" },
  { id: "agent-2", name: "Alice Agent", email: "alice@example.com", role: "agent" },
];

const defaultProps = {
  ticket: mockTicket,
  isAdmin: true,
  agents: mockAgents,
  onStatusChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onAssign: vi.fn(),
  isPending: false,
  isError: false,
};

describe("TicketSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders status, category, assigned to, and last updated labels", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} />);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Assigned To")).toBeInTheDocument();
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
  });

  it("shows current status value", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows current category value", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} />);
    expect(screen.getByText("Technical Question")).toBeInTheDocument();
  });

  it("shows 'None' when category is null", () => {
    renderWithProviders(
      <TicketSidebar
        {...defaultProps}
        ticket={{ ...mockTicket, category: null }}
      />,
    );
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("shows 'Unassigned' when no agent assigned", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} />);
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("shows assigned agent name when assigned", () => {
    renderWithProviders(
      <TicketSidebar
        {...defaultProps}
        ticket={{
          ...mockTicket,
          assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
        }}
      />,
    );
    expect(screen.getByText("Bob Agent")).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} />);
    expect(
      screen.getByText(new Date(mockTicket.updatedAt).toLocaleString()),
    ).toBeInTheDocument();
  });

  it("calls onStatusChange when status is changed", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    renderWithProviders(
      <TicketSidebar {...defaultProps} onStatusChange={onStatusChange} />,
    );

    const comboboxes = screen.getAllByRole("combobox");
    const statusDropdown = comboboxes.find((el) =>
      el.textContent?.includes("Open"),
    )!;
    await user.click(statusDropdown);
    const option = await screen.findByRole("option", { name: /Resolved/ });
    await user.click(option);

    expect(onStatusChange).toHaveBeenCalledWith("RESOLVED", expect.anything());
  });

  it("calls onCategoryChange when category is changed", async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    renderWithProviders(
      <TicketSidebar {...defaultProps} onCategoryChange={onCategoryChange} />,
    );

    const comboboxes = screen.getAllByRole("combobox");
    const categoryDropdown = comboboxes.find((el) =>
      el.textContent?.includes("Technical Question"),
    )!;
    await user.click(categoryDropdown);
    const option = await screen.findByRole("option", { name: /Refund Request/ });
    await user.click(option);

    expect(onCategoryChange).toHaveBeenCalledWith("REFUND_REQUEST", expect.anything());
  });

  it("calls onAssign when agent is selected (admin)", async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();
    renderWithProviders(
      <TicketSidebar {...defaultProps} onAssign={onAssign} />,
    );

    const comboboxes = screen.getAllByRole("combobox");
    const assignDropdown = comboboxes.find((el) =>
      el.textContent?.includes("Unassigned"),
    )!;
    await user.click(assignDropdown);
    const option = await screen.findByRole("option", { name: /Bob Agent/ });
    await user.click(option);

    expect(onAssign).toHaveBeenCalledWith("agent-1", expect.anything());
  });

  it("shows static text instead of dropdown for agents (non-admin)", () => {
    renderWithProviders(
      <TicketSidebar
        {...defaultProps}
        isAdmin={false}
        ticket={{
          ...mockTicket,
          assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
        }}
      />,
    );
    expect(screen.getByText("Bob Agent (bob@example.com)")).toBeInTheDocument();
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBe(2);
  });

  it("shows error alert when isError is true", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} isError={true} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to update ticket.",
    );
  });

  it("does not show error alert when isError is false", () => {
    renderWithProviders(<TicketSidebar {...defaultProps} isError={false} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
