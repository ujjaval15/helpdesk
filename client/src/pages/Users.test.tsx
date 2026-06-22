import { screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import { renderWithProviders } from "../test/render";
import Users from "./Users";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../lib/auth-client", () => ({
  useSession: () => ({
    data: {
      user: { name: "admin", email: "admin@test.com", role: "admin" },
    },
  }),
  signOut: vi.fn(),
}));

const mockUsers = [
  {
    id: "1",
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin" as const,
    createdAt: "2026-01-15T10:00:00.000Z",
    image: null,
  },
  {
    id: "2",
    name: "Bob Agent",
    email: "bob@example.com",
    role: "agent" as const,
    createdAt: "2026-02-20T12:00:00.000Z",
    image: null,
  },
  {
    id: "3",
    name: "Charlie Agent",
    email: "charlie@example.com",
    role: "agent" as const,
    createdAt: "2026-03-10T08:30:00.000Z",
    image: "https://example.com/charlie.jpg",
  },
];

describe("Users page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton rows while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Users />);

    const skeletons = screen.getAllByTestId
      ? document.querySelectorAll('[data-slot="skeleton"]')
      : document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders the page title and description", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(
      screen.getByText("Manage team members and their roles."),
    ).toBeInTheDocument();
  });

  it("renders table headers", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Alice Admin");

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("renders all users with name, email, role badge, and date", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Alice Admin");

    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();

    expect(screen.getByText("Bob Agent")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();

    expect(screen.getByText("Charlie Agent")).toBeInTheDocument();
    expect(screen.getByText("charlie@example.com")).toBeInTheDocument();
  });

  it("displays role badges with correct text", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Alice Admin");

    const badges = document.querySelectorAll('[data-slot="badge"]');
    const badgeTexts = Array.from(badges).map((b) => b.textContent);
    expect(badgeTexts).toEqual(["admin", "agent", "agent"]);
  });

  it("displays avatar initials for users without images", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Alice Admin");

    const fallbacks = document.querySelectorAll('[data-slot="avatar-fallback"]');
    const initials = Array.from(fallbacks).map((f) => f.textContent);
    expect(initials).toContain("AL");
    expect(initials).toContain("BO");
  });

  it("renders an avatar for each user", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Charlie Agent");

    const avatars = document.querySelectorAll(
      '[data-slot="table-body"] [data-slot="avatar"]',
    );
    expect(avatars).toHaveLength(3);
  });

  it("formats created dates", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Alice Admin");

    const dateStr = new Date("2026-01-15T10:00:00.000Z").toLocaleDateString();
    expect(screen.getByText(dateStr)).toBeInTheDocument();
  });

  it("renders the correct number of table rows", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithProviders(<Users />);

    await screen.findByText("Alice Admin");

    const tbody = document.querySelector('[data-slot="table-body"]')!;
    const rows = within(tbody as HTMLElement).getAllByRole("row");
    expect(rows).toHaveLength(3);
  });

  it("calls the correct API endpoint", () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: [] } });
    renderWithProviders(<Users />);

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/admin/users");
  });

  it("shows error message when API call fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));
    renderWithProviders(<Users />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Failed to load users. Please try again later.",
    );
  });

  it("renders an empty table when there are no users", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { users: [] } });
    renderWithProviders(<Users />);

    await vi.waitFor(() => {
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(0);
    });

    const tbody = document.querySelector('[data-slot="table-body"]')!;
    const rows = tbody.querySelectorAll('[data-slot="table-row"]');
    expect(rows).toHaveLength(0);
  });
});
