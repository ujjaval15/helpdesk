import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import axios from "axios";
import { renderWithProviders } from "../test/render";
import DeleteUserDialog from "./DeleteUserDialog";
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

function renderDialog(user: User = mockUser) {
  const onOpenChange = vi.fn();
  renderWithProviders(
    <DeleteUserDialog user={user} open onOpenChange={onOpenChange} />,
  );
  return { onOpenChange };
}

describe("DeleteUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows confirmation with user name", () => {
    renderDialog();

    expect(screen.getByText("Delete User")).toBeInTheDocument();
    expect(screen.getByText("Bob Agent")).toBeInTheDocument();
  });

  it("shows Cancel and Delete buttons", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  describe("successful deletion", () => {
    it("calls DELETE API and closes dialog on confirm", async () => {
      const user = userEvent.setup();
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
      const { onOpenChange } = renderDialog();

      await user.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          "/api/admin/users/user-1",
        );
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("shows Deleting… while request is pending", async () => {
      const user = userEvent.setup();
      mockedAxios.delete.mockReturnValue(new Promise(() => {}));
      renderDialog();

      await user.click(screen.getByRole("button", { name: "Delete" }));

      expect(await screen.findByText("Deleting…")).toBeInTheDocument();
    });
  });

  describe("server errors", () => {
    it("shows error when server rejects deletion", async () => {
      const user = userEvent.setup();
      const error = new Error("Request failed") as any;
      error.isAxiosError = true;
      error.response = {
        status: 403,
        data: { error: "Admin users cannot be deleted" },
      };
      mockedAxios.delete.mockRejectedValueOnce(error);
      mockedAxios.isAxiosError.mockReturnValue(true);
      renderDialog();

      await user.click(screen.getByRole("button", { name: "Delete" }));

      expect(
        await screen.findByText("Admin users cannot be deleted"),
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

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });
});
