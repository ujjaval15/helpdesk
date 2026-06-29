import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../test/render";
import ReplyThread from "./ReplyThread";
import type { Reply } from "@/lib/ticket-constants";

const mockReplies: Reply[] = [
  {
    id: 1,
    body: "We are looking into this.",
    senderType: "AGENT",
    senderName: "Admin User",
    senderEmail: "admin@example.com",
    createdAt: "2026-06-01T12:00:00.000Z",
  },
  {
    id: 2,
    body: "Thanks for the update!",
    senderType: "CUSTOMER",
    senderName: "Jane Doe",
    senderEmail: "jane@example.com",
    createdAt: "2026-06-01T13:00:00.000Z",
  },
];

describe("ReplyThread", () => {
  it("renders the Replies heading", () => {
    renderWithProviders(<ReplyThread replies={[]} isPending={false} />);
    expect(screen.getByText("Replies")).toBeInTheDocument();
  });

  it("shows loading skeletons when pending", () => {
    renderWithProviders(<ReplyThread replies={undefined} isPending={true} />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBe(2);
  });

  it("shows empty state when there are no replies", () => {
    renderWithProviders(<ReplyThread replies={[]} isPending={false} />);
    expect(screen.getByText("No replies yet.")).toBeInTheDocument();
  });

  it("does not show empty state when replies is undefined", () => {
    renderWithProviders(<ReplyThread replies={undefined} isPending={false} />);
    expect(screen.queryByText("No replies yet.")).not.toBeInTheDocument();
  });

  it("renders reply sender names", () => {
    renderWithProviders(
      <ReplyThread replies={mockReplies} isPending={false} />,
    );
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders reply bodies", () => {
    renderWithProviders(
      <ReplyThread replies={mockReplies} isPending={false} />,
    );
    expect(screen.getByText("We are looking into this.")).toBeInTheDocument();
    expect(screen.getByText("Thanks for the update!")).toBeInTheDocument();
  });

  it("renders sender type badges", () => {
    renderWithProviders(
      <ReplyThread replies={mockReplies} isPending={false} />,
    );
    expect(screen.getByText("Agent")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
  });

  it("renders timestamps for each reply", () => {
    renderWithProviders(
      <ReplyThread replies={mockReplies} isPending={false} />,
    );
    expect(
      screen.getByText(new Date(mockReplies[0].createdAt).toLocaleString()),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new Date(mockReplies[1].createdAt).toLocaleString()),
    ).toBeInTheDocument();
  });
});
