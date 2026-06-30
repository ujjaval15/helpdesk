import { screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import { renderWithProviders } from "../test/render";
import Dashboard from "./Dashboard";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../lib/auth-client", () => ({
  useSession: () => ({
    data: { user: { name: "admin", email: "admin@test.com", role: "admin" } },
  }),
  signOut: vi.fn(),
}));

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="chart-container">{children}</div>
    ),
  };
});

const mockStats = {
  total: 120,
  open: 18,
  resolvedByAI: 84,
  pctResolvedByAI: 70,
  avgResolutionMs: 1000 * 60 * 135, // 2h 15m
};

const mockDaily = {
  daily: [
    { date: "2026-06-29", count: 5 },
    { date: "2026-06-30", count: 3 },
  ],
};

function mockBothEndpoints() {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url === "/api/tickets/stats") return Promise.resolve({ data: mockStats });
    if (url === "/api/tickets/stats/daily") return Promise.resolve({ data: mockDaily });
    return Promise.reject(new Error("unexpected url"));
  });
}

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title and description", async () => {
    mockBothEndpoints();
    renderWithProviders(<Dashboard />);

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("An overview of ticket volume and AI performance."),
    ).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Dashboard />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it("requests both stats endpoints", async () => {
    mockBothEndpoints();
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets/stats");
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets/stats/daily");
    });
  });

  it("renders all metrics from the response", async () => {
    mockBothEndpoints();
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("84")).toBeInTheDocument();
    expect(screen.getByText("70.0%")).toBeInTheDocument();
    expect(screen.getByText("2h 15m")).toBeInTheDocument();
  });

  it("renders an em dash when there is no resolution time", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/stats")
        return Promise.resolve({ data: { ...mockStats, avgResolutionMs: null } });
      if (url === "/api/tickets/stats/daily")
        return Promise.resolve({ data: mockDaily });
      return Promise.reject(new Error("unexpected url"));
    });
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText("—")).toBeInTheDocument();
  });

  it("renders the chart card", async () => {
    mockBothEndpoints();
    renderWithProviders(<Dashboard />);

    expect(await screen.findByText("Tickets per day")).toBeInTheDocument();
    expect(
      screen.getByText("Total tickets received over the past 30 days"),
    ).toBeInTheDocument();
  });

  it("shows an error message when the stats request fails", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/stats") return Promise.reject(new Error("boom"));
      if (url === "/api/tickets/stats/daily")
        return Promise.resolve({ data: mockDaily });
      return Promise.reject(new Error("unexpected url"));
    });
    renderWithProviders(<Dashboard />);

    expect(
      await screen.findByText(
        "Failed to load dashboard stats. Please try again later.",
      ),
    ).toBeInTheDocument();
  });
});
