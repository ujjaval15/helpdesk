import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import { renderWithProviders } from "../test/render";
import CreateUserDialog from "./CreateUserDialog";

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

function renderDialog(open = true) {
  const onOpenChange = vi.fn();
  renderWithProviders(
    <CreateUserDialog open={open} onOpenChange={onOpenChange} />,
  );
  return { onOpenChange };
}

describe("CreateUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validation errors", () => {
    it("shows all errors when submitting an empty form", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("Name must be at least 3 characters"),
      ).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("shows error for name shorter than 3 characters", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "AB");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("Name must be at least 3 characters"),
      ).toBeInTheDocument();
    });

    it("shows error for invalid email", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "Test User");
      await user.type(screen.getByLabelText("Email"), "not-an-email");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("Enter a valid email"),
      ).toBeInTheDocument();
    });

    it("shows error for password shorter than 8 characters", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "Test User");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "short");
      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("shows error for whitespace-only name", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "   ");
      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("Name must be at least 3 characters"),
      ).toBeInTheDocument();
    });
  });

  describe("successful submission", () => {
    it("calls the API with form data and closes the dialog", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          user: {
            id: "1",
            name: "New Agent",
            email: "agent@example.com",
            role: "agent",
          },
        },
      });
      const { onOpenChange } = renderDialog();

      await user.type(screen.getByLabelText("Name"), "New Agent");
      await user.type(screen.getByLabelText("Email"), "agent@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Create" }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/admin/users", {
          name: "New Agent",
          email: "agent@example.com",
          password: "password123",
        });
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("shows Creating… while submitting", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockReturnValue(new Promise(() => {}));
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "New Agent");
      await user.type(screen.getByLabelText("Email"), "agent@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(await screen.findByText("Creating…")).toBeInTheDocument();
    });
  });

  describe("server errors", () => {
    it("shows duplicate email error from server", async () => {
      const user = userEvent.setup();
      const error = new Error("Request failed") as any;
      error.isAxiosError = true;
      error.response = {
        status: 409,
        data: { error: "A user with this email already exists" },
      };
      mockedAxios.post.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValue(true);
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "New Agent");
      await user.type(screen.getByLabelText("Email"), "existing@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("A user with this email already exists"),
      ).toBeInTheDocument();
    });
  });

  describe("cancel", () => {
    it("calls onOpenChange(false) when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderDialog();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not call the API when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.type(screen.getByLabelText("Name"), "New Agent");
      await user.type(screen.getByLabelText("Email"), "agent@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});
