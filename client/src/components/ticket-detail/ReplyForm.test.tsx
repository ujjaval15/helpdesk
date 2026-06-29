import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import { renderWithProviders } from "../../test/render";
import ReplyForm from "./ReplyForm";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("ReplyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textarea and submit button", () => {
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);
    expect(
      screen.getByPlaceholderText("Write a reply..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reply/i }),
    ).toBeInTheDocument();
  });

  it("shows validation error when submitting empty form", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);

    await user.click(screen.getByRole("button", { name: /send reply/i }));

    expect(
      await screen.findByText("Reply cannot be empty"),
    ).toBeInTheDocument();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("calls POST with reply body when submitted", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        reply: {
          id: 1,
          body: "Test reply",
          senderType: "AGENT",
          senderName: "Admin",
          senderEmail: "admin@test.com",
          createdAt: "2026-06-01T10:00:00.000Z",
        },
      },
    });
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);

    await user.type(
      screen.getByPlaceholderText("Write a reply..."),
      "Test reply",
    );
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/tickets/42/replies",
        { body: "Test reply" },
      );
    });
  });

  it("clears textarea after successful submission", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        reply: {
          id: 1,
          body: "Test reply",
          senderType: "AGENT",
          senderName: "Admin",
          senderEmail: "admin@test.com",
          createdAt: "2026-06-01T10:00:00.000Z",
        },
      },
    });
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);

    const textarea = screen.getByPlaceholderText("Write a reply...");
    await user.type(textarea, "Test reply");
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });

  it("shows error alert when submission fails", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);

    await user.type(
      screen.getByPlaceholderText("Write a reply..."),
      "Test reply",
    );
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to send reply.",
    );
  });

  it("shows 'Sending...' while request is pending", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);

    await user.type(
      screen.getByPlaceholderText("Write a reply..."),
      "Test reply",
    );
    await user.click(screen.getByRole("button", { name: /send reply/i }));

    expect(await screen.findByText("Sending...")).toBeInTheDocument();
  });
});
