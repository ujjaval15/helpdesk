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

  it("renders textarea, polish button, and submit button", () => {
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);
    expect(
      screen.getByPlaceholderText("Write a reply..."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /polish/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reply/i }),
    ).toBeInTheDocument();
  });

  it("disables send and polish buttons when textarea is empty", () => {
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);
    expect(screen.getByRole("button", { name: /send reply/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /polish/i })).toBeDisabled();
  });

  it("enables send and polish buttons when textarea has content", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="Test body" />);

    await user.type(screen.getByPlaceholderText("Write a reply..."), "Hello");

    expect(screen.getByRole("button", { name: /send reply/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /polish/i })).toBeEnabled();
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

  it("calls polish endpoint with draft and ticketBody", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: { polished: "Polished reply text" },
    });
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="My issue" />);

    await user.type(
      screen.getByPlaceholderText("Write a reply..."),
      "rough draft",
    );
    await user.click(screen.getByRole("button", { name: /polish/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/tickets/42/polish-reply",
        { draft: "rough draft", ticketBody: "My issue" },
      );
    });
  });

  it("replaces textarea content with polished text on success", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: { polished: "Polished reply text" },
    });
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="My issue" />);

    const textarea = screen.getByPlaceholderText("Write a reply...");
    await user.type(textarea, "rough draft");
    await user.click(screen.getByRole("button", { name: /polish/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue("Polished reply text");
    });
  });

  it("shows 'Polishing...' while polish request is pending", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="My issue" />);

    await user.type(
      screen.getByPlaceholderText("Write a reply..."),
      "rough draft",
    );
    await user.click(screen.getByRole("button", { name: /polish/i }));

    expect(await screen.findByText("Polishing...")).toBeInTheDocument();
  });

  it("shows error alert when polish request fails", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce(new Error("API error"));
    renderWithProviders(<ReplyForm ticketId="42" ticketBody="My issue" />);

    await user.type(
      screen.getByPlaceholderText("Write a reply..."),
      "rough draft",
    );
    await user.click(screen.getByRole("button", { name: /polish/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to polish reply.",
      );
    });
  });
});
