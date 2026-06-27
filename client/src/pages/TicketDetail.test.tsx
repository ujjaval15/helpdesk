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
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: mockTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/customer@example.com/)).toBeInTheDocument();
    expect(screen.getByText("I get a 500 error when trying to sign in.")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows status and category badges", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: mockTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
  });

  it("shows agent select dropdown for admin users", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: mockTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows static text instead of dropdown for agent users", async () => {
    currentSession = mockAgentSession;

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({
          data: {
            ticket: {
              ...mockTicket,
              assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
            },
          },
        });
      }
      return Promise.resolve({ data: { users: [] } });
    });

    renderTicketDetail();

    await screen.findByText("Cannot log in");
    expect(screen.getByText("Bob Agent (bob@example.com)")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows assigned agent name in the dropdown when ticket is assigned", async () => {
    const assignedTicket = {
      ...mockTicket,
      assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
    };

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: assignedTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    renderTicketDetail();

    await screen.findByText("Cannot log in");
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveTextContent("Bob Agent");
  });

  it("calls PATCH to assign agent when selection changes", async () => {
    const user = userEvent.setup();
    const updatedTicket = {
      ...mockTicket,
      assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
    };

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: mockTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    mockedAxios.patch.mockResolvedValue({ data: { ticket: updatedTicket } });

    renderTicketDetail();

    await screen.findByText("Cannot log in");

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

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
    const assignedTicket = {
      ...mockTicket,
      assignedAgent: { id: "agent-1", name: "Bob Agent", email: "bob@example.com" },
    };

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: assignedTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    mockedAxios.patch.mockResolvedValue({ data: { ticket: { ...mockTicket, assignedAgent: null } } });

    renderTicketDetail();

    await screen.findByText("Cannot log in");

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const option = await screen.findByRole("option", { name: /Unassigned/ });
    await user.click(option);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        assignedAgentId: null,
      });
    });
  });

  it("shows error message when assignment fails", async () => {
    const user = userEvent.setup();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: mockTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    mockedAxios.patch.mockRejectedValue(new Error("Server error"));

    renderTicketDetail();

    await screen.findByText("Cannot log in");

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const option = await screen.findByRole("option", { name: /Bob Agent/ });
    await user.click(option);

    await screen.findByText(/failed to assign agent/i);
  });

  it("shows 'Back to tickets' link", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: mockTicket } });
      }
      return Promise.resolve({ data: { users: mockAgents } });
    });

    renderTicketDetail();

    const link = screen.getByRole("link", { name: /back to tickets/i });
    expect(link).toHaveAttribute("href", "/tickets");
  });

  it("fetches the correct ticket by ID from the URL", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/api/tickets/")) {
        return Promise.resolve({ data: { ticket: { ...mockTicket, id: 42 } } });
      }
      return Promise.resolve({ data: { users: [] } });
    });

    renderTicketDetail("42");

    await screen.findByText("#42");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets/42");
  });
});
