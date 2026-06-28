import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import TicketDetail from "./TicketDetail";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

const mockAdminSession = {
  data: {
    user: { id: "admin-1", name: "Admin", email: "admin@test.com", role: "admin" },
  },
  isPending: false,
};

const mockAgentSession = {
  data: {
    user: { id: "agent-1", name: "Agent", email: "agent@test.com", role: "agent" },
  },
  isPending: false,
};

let currentSession = mockAdminSession;

vi.mock("../lib/auth-client", () => ({
  useSession: () => currentSession,
  signOut: vi.fn(),
}));

const mockTicket = {
  id: 1,
  subject: "Cannot log in",
  body: "I get a 500 error when trying to sign in.",
  status: "OPEN",
  category: "TECHNICAL_QUESTION",
  customerEmail: "customer@example.com",
  customerName: "Jane Doe",
  assignedAgent: null,
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z",
};

const mockAgents = [
  { id: "agent-1", name: "Bob Agent", email: "bob@example.com", role: "agent" },
  { id: "agent-2", name: "Charlie Agent", email: "charlie@example.com", role: "agent" },
];

function setupGetMock(ticket = mockTicket, agents = mockAgents) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes("/api/tickets/")) {
      return Promise.resolve({ data: { ticket } });
    }
    return Promise.resolve({ data: { users: agents } });
  });
}

function renderTicketDetail(ticketId = "1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TicketDetail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSession = mockAdminSession;
  });

  it("shows loading skeleton while fetching", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderTicketDetail();

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows error message when fetch fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    renderTicketDetail();

    await screen.findByRole("alert");
    expect(screen.getByText(/failed to load ticket/i)).toBeInTheDocument();
  });

  it("renders ticket details after loading", async () => {
    setupGetMock();
    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/customer@example.com/)).toBeInTheDocument();
    expect(screen.getByText("I get a 500 error when trying to sign in.")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows status and category badges", async () => {
    setupGetMock();
    renderTicketDetail();

    await screen.findByText("Cannot log in");
    const statusBadge = document.querySelector('[data-slot="badge"][data-variant="destructive"]');
    expect(statusBadge).toHaveTextContent("Open");
    const categoryBadge = document.querySelector('[data-slot="badge"][data-variant="outline"]');
    expect(categoryBadge).toHaveTextContent("Technical Question");
  });

  it("shows 'Back to tickets' link", async () => {
    setupGetMock();
    renderTicketDetail();

    const link = screen.getByRole("link", { name: /back to tickets/i });
    expect(link).toHaveAttribute("href", "/tickets");
  });

  it("fetches the correct ticket by ID from the URL", async () => {
    setupGetMock({ ...mockTicket, id: 42 });
    renderTicketDetail("42");

    await screen.findByText("#42");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets/42");
  });
});

describe("TicketDetail — agent assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSession = mockAdminSession;
  });

  it("shows agent select dropdown for admin users", async () => {
    setupGetMock();
    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBe(3);
  });

  it("shows static text for agent assignment when user is an agent", async () => {
    currentSession = mockAgentSession;
    setupGetMock({
      ...mockTicket,
      assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
    });

    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Bob Agent (bob@example.com)")).toBeInTheDocument();
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBe(2);
  });

  it("calls PATCH to assign agent when selection changes", async () => {
    const user = userEvent.setup();
    setupGetMock();
    mockedAxios.patch.mockResolvedValue({
      data: {
        ticket: {
          ...mockTicket,
          assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
        },
      },
    });

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const assignDropdown = comboboxes.find((el) => el.textContent?.includes("Unassigned"))!;
    await user.click(assignDropdown);

    const option = await screen.findByRole("option", { name: /Bob Agent/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        assignedAgentId: "agent-1",
      });
    });
  });

  it("calls PATCH with null when unassigning", async () => {
    const user = userEvent.setup();
    setupGetMock({
      ...mockTicket,
      assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
    });
    mockedAxios.patch.mockResolvedValue({
      data: { ticket: { ...mockTicket, assignedAgent: null } },
    });

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const assignDropdown = comboboxes.find((el) => el.textContent?.includes("Bob Agent"))!;
    await user.click(assignDropdown);

    const option = await screen.findByRole("option", { name: /^Unassigned$/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        assignedAgentId: null,
      });
    });
  });
});

describe("TicketDetail — status update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSession = mockAdminSession;
  });

  it("shows status dropdown with current value", async () => {
    setupGetMock();
    renderTicketDetail();

    await screen.findByText("Cannot log in");
    const comboboxes = screen.getAllByRole("combobox");
    const statusDropdown = comboboxes.find((el) => el.textContent?.includes("Open"))!;
    expect(statusDropdown).toBeInTheDocument();
  });

  it("calls PATCH with new status when changed", async () => {
    const user = userEvent.setup();
    setupGetMock();
    mockedAxios.patch.mockResolvedValue({
      data: { ticket: { ...mockTicket, status: "RESOLVED" } },
    });

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const statusDropdown = comboboxes.find((el) => el.textContent?.includes("Open"))!;
    await user.click(statusDropdown);

    const option = await screen.findByRole("option", { name: /Resolved/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        status: "RESOLVED",
      });
    });
  });

  it("agent can also change status", async () => {
    const user = userEvent.setup();
    currentSession = mockAgentSession;
    setupGetMock({
      ...mockTicket,
      assignedAgent: { id: "agent-1", name: "Agent", email: "agent@test.com" },
    });
    mockedAxios.patch.mockResolvedValue({
      data: { ticket: { ...mockTicket, status: "CLOSED" } },
    });

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const statusDropdown = comboboxes.find((el) => el.textContent?.includes("Open"))!;
    await user.click(statusDropdown);

    const option = await screen.findByRole("option", { name: /Closed/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        status: "CLOSED",
      });
    });
  });
});

describe("TicketDetail — category update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSession = mockAdminSession;
  });

  it("shows category dropdown with current value", async () => {
    setupGetMock();
    renderTicketDetail();

    await screen.findByText("Cannot log in");
    const comboboxes = screen.getAllByRole("combobox");
    const categoryDropdown = comboboxes.find((el) => el.textContent?.includes("Technical Question"))!;
    expect(categoryDropdown).toBeInTheDocument();
  });

  it("calls PATCH with new category when changed", async () => {
    const user = userEvent.setup();
    setupGetMock();
    mockedAxios.patch.mockResolvedValue({
      data: { ticket: { ...mockTicket, category: "REFUND_REQUEST" } },
    });

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const categoryDropdown = comboboxes.find((el) => el.textContent?.includes("Technical Question"))!;
    await user.click(categoryDropdown);

    const option = await screen.findByRole("option", { name: /Refund Request/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        category: "REFUND_REQUEST",
      });
    });
  });

  it("calls PATCH with null when clearing category", async () => {
    const user = userEvent.setup();
    setupGetMock();
    mockedAxios.patch.mockResolvedValue({
      data: { ticket: { ...mockTicket, category: null } },
    });

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const categoryDropdown = comboboxes.find((el) => el.textContent?.includes("Technical Question"))!;
    await user.click(categoryDropdown);

    const option = await screen.findByRole("option", { name: /^None$/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        category: null,
      });
    });
  });

  it("shows 'None' when ticket has no category", async () => {
    setupGetMock({ ...mockTicket, category: null });
    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("None")).toBeInTheDocument();
  });
});

describe("TicketDetail — error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSession = mockAdminSession;
  });

  it("shows error message when update fails", async () => {
    const user = userEvent.setup();
    setupGetMock();
    mockedAxios.patch.mockRejectedValue(new Error("Server error"));

    renderTicketDetail();
    await screen.findByText("Cannot log in");

    const comboboxes = screen.getAllByRole("combobox");
    const statusDropdown = comboboxes.find((el) => el.textContent?.includes("Open"))!;
    await user.click(statusDropdown);

    const option = await screen.findByRole("option", { name: /Resolved/ });
    await user.click(option);

    await screen.findByText(/failed to update ticket/i);
  });
});
