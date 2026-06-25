import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import { renderWithProviders } from "../test/render";
import UserFormDialog from "./UserFormDialog";
import type { User } from "./UsersTable";

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

const mockUser: User = {
  id: "user-1",
  name: "Bob Agent",
  email: "bob@example.com",
  role: "agent",
  createdAt: "2026-01-15T10:00:00.000Z",
  image: null,
};

function renderCreateDialog() {
  const onOpenChange = vi.fn();
  renderWithProviders(
    <UserFormDialog open onOpenChange={onOpenChange} />,
  );
  return { onOpenChange };
}

function renderEditDialog(user: User = mockUser) {
  const onOpenChange = vi.fn();
  renderWithProviders(
    <UserFormDialog user={user} open onOpenChange={onOpenChange} />,
  );
  return { onOpenChange };
}

describe("UserFormDialog — create mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Create User title and description", () => {
    renderCreateDialog();

    expect(screen.getByText("Create User")).toBeInTheDocument();
    expect(screen.getByText("Add a new agent to the team.")).toBeInTheDocument();
  });

  describe("validation errors", () => {
    it("shows all errors when submitting an empty form", async () => {
      const user = userEvent.setup();
      renderCreateDialog();

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
      renderCreateDialog();

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
      renderCreateDialog();

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
      renderCreateDialog();

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
      renderCreateDialog();

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
    it("calls POST with form data and closes the dialog", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          user: { id: "1", name: "New Agent", email: "agent@example.com", role: "agent" },
        },
      });
      const { onOpenChange } = renderCreateDialog();

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
      renderCreateDialog();

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
      error.response = { status: 409, data: { error: "A user with this email already exists" } };
      mockedAxios.post.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValue(true);
      renderCreateDialog();

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
      const { onOpenChange } = renderCreateDialog();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not call the API when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderCreateDialog();

      await user.type(screen.getByLabelText("Name"), "New Agent");
      await user.type(screen.getByLabelText("Email"), "agent@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});

describe("UserFormDialog — edit mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Edit User title and description", () => {
    renderEditDialog();

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(
      screen.getByText("Update user details. Leave password blank to keep it unchanged."),
    ).toBeInTheDocument();
  });

  describe("pre-filled form", () => {
    it("populates name and email from the user prop", () => {
      renderEditDialog();

      expect(screen.getByLabelText("Name")).toHaveValue("Bob Agent");
      expect(screen.getByLabelText("Email")).toHaveValue("bob@example.com");
    });

    it("leaves password field empty", () => {
      renderEditDialog();

      expect(screen.getByLabelText("Password")).toHaveValue("");
    });

    it("shows placeholder text on password field", () => {
      renderEditDialog();

      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "placeholder",
        "Leave blank to keep unchanged",
      );
    });
  });

  describe("validation errors", () => {
    it("shows error when name is cleared and submitted", async () => {
      const user = userEvent.setup();
      renderEditDialog();

      await user.clear(screen.getByLabelText("Name"));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("Name must be at least 3 characters"),
      ).toBeInTheDocument();
    });

    it("shows error when email is cleared and submitted", async () => {
      const user = userEvent.setup();
      renderEditDialog();

      await user.clear(screen.getByLabelText("Email"));
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("Email is required"),
      ).toBeInTheDocument();
    });

    it("shows error for short password", async () => {
      const user = userEvent.setup();
      renderEditDialog();

      await user.type(screen.getByLabelText("Password"), "short");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });

    it("allows empty password (no error)", async () => {
      const user = userEvent.setup();
      mockedAxios.patch.mockResolvedValueOnce({
        data: { user: { id: "user-1", name: "Bob Agent", email: "bob@example.com", role: "agent" } },
      });
      renderEditDialog();

      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(mockedAxios.patch).toHaveBeenCalled();
      });
    });
  });

  describe("successful submission", () => {
    it("sends PATCH without password when password is blank", async () => {
      const user = userEvent.setup();
      mockedAxios.patch.mockResolvedValueOnce({
        data: { user: { id: "user-1", name: "Updated Bob", email: "bob@example.com", role: "agent" } },
      });
      const { onOpenChange } = renderEditDialog();

      await user.clear(screen.getByLabelText("Name"));
      await user.type(screen.getByLabelText("Name"), "Updated Bob");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(mockedAxios.patch).toHaveBeenCalledWith(
          "/api/admin/users/user-1",
          { name: "Updated Bob", email: "bob@example.com" },
        );
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("sends PATCH with password when password is provided", async () => {
      const user = userEvent.setup();
      mockedAxios.patch.mockResolvedValueOnce({
        data: { user: { id: "user-1", name: "Bob Agent", email: "bob@example.com", role: "agent" } },
      });
      const { onOpenChange } = renderEditDialog();

      await user.type(screen.getByLabelText("Password"), "newpassword123");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(mockedAxios.patch).toHaveBeenCalledWith(
          "/api/admin/users/user-1",
          { name: "Bob Agent", email: "bob@example.com", password: "newpassword123" },
        );
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("shows Saving… while submitting", async () => {
      const user = userEvent.setup();
      mockedAxios.patch.mockReturnValue(new Promise(() => {}));
      renderEditDialog();

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(await screen.findByText("Saving…")).toBeInTheDocument();
    });
  });

  describe("server errors", () => {
    it("shows duplicate email error from server", async () => {
      const user = userEvent.setup();
      const error = new Error("Request failed") as any;
      error.isAxiosError = true;
      error.response = { status: 409, data: { error: "A user with this email already exists" } };
      mockedAxios.patch.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValue(true);
      renderEditDialog();

      await user.clear(screen.getByLabelText("Email"));
      await user.type(screen.getByLabelText("Email"), "taken@example.com");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("A user with this email already exists"),
      ).toBeInTheDocument();
    });
  });

  describe("cancel", () => {
    it("calls onOpenChange(false) when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const { onOpenChange } = renderEditDialog();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not call the API when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderEditDialog();

      await user.clear(screen.getByLabelText("Name"));
      await user.type(screen.getByLabelText("Name"), "Changed Name");
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockedAxios.patch).not.toHaveBeenCalled();
    });
  });
});
