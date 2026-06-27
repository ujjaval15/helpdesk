import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = "admin@test.com";
const TEST_PASSWORD = "testpassword123!";

/**
 * Helper: sign in via the API and persist cookies so subsequent navigations
 * are already authenticated.
 */
async function loginViaAPI(page: Page) {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
}

/**
 * Helper: create a user through the UI form dialog.
 * Waits for the dialog to close after successful creation.
 */
async function createUserViaUI(
  page: Page,
  opts: { name: string; email: string; password: string },
) {
  await page.getByRole("button", { name: "Create User" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Name").fill(opts.name);
  await dialog.getByLabel("Email").fill(opts.email);
  await dialog.getByLabel("Password").fill(opts.password);

  await dialog.getByRole("button", { name: "Create" }).click();

  // Wait for dialog to close, indicating success
  await expect(dialog).not.toBeVisible();
}

// ---------------------------------------------------------------------------
// User management CRUD operations
// ---------------------------------------------------------------------------
test.describe("User management", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/users");

    // Wait for the table to render with at least the admin user
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // List users
  // -------------------------------------------------------------------------
  test("should display the users table with the seeded admin user", async ({
    page,
  }) => {
    // Verify the admin row is present with correct data
    const adminRow = page.getByRole("row").filter({ hasText: TEST_EMAIL });
    await expect(adminRow).toBeVisible();
    await expect(
      adminRow.getByRole("cell", { name: "admin", exact: true }),
    ).toBeVisible();

    // Verify table column headers
    await expect(
      page.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Email" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Role" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Created" }),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Create user
  // -------------------------------------------------------------------------
  test("should create a new user and display them in the table", async ({
    page,
  }) => {
    const ts = Date.now();
    const uniqueEmail = `create-${ts}@test.com`;
    const userName = `New Agent ${ts}`;

    await createUserViaUI(page, {
      name: userName,
      email: uniqueEmail,
      password: "securepassword1!",
    });

    // Verify the new user row appears in the table
    const newRow = page.getByRole("row").filter({ hasText: uniqueEmail });
    await expect(newRow).toBeVisible();
    await expect(newRow.getByText(userName)).toBeVisible();
    await expect(
      newRow.getByRole("cell", { name: "agent", exact: true }),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Edit user name
  // -------------------------------------------------------------------------
  test("should edit a user name and display the updated name in the table", async ({
    page,
  }) => {
    const ts = Date.now();
    const uniqueEmail = `edit-name-${ts}@test.com`;
    const originalName = `Edit Target ${ts}`;
    const updatedName = `Updated Name ${ts}`;

    // Create the user first
    await createUserViaUI(page, {
      name: originalName,
      email: uniqueEmail,
      password: "securepassword1!",
    });

    // Click the edit button for the created user
    await page.getByRole("button", { name: `Edit ${originalName}` }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify form is pre-filled
    await expect(dialog.getByLabel("Name")).toHaveValue(originalName);
    await expect(dialog.getByLabel("Email")).toHaveValue(uniqueEmail);

    // Change the name
    await dialog.getByLabel("Name").clear();
    await dialog.getByLabel("Name").fill(updatedName);
    await dialog.getByRole("button", { name: "Save" }).click();

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible();

    // Verify the updated name appears in the table
    const updatedRow = page.getByRole("row").filter({ hasText: uniqueEmail });
    await expect(updatedRow.getByText(updatedName)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Edit user with new password
  // -------------------------------------------------------------------------
  test("should edit a user with a new password successfully", async ({
    page,
  }) => {
    const ts = Date.now();
    const uniqueEmail = `edit-pass-${ts}@test.com`;
    const userName = `Password Target ${ts}`;

    // Create the user first
    await createUserViaUI(page, {
      name: userName,
      email: uniqueEmail,
      password: "securepassword1!",
    });

    // Click the edit button
    await page.getByRole("button", { name: `Edit ${userName}` }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify password placeholder indicates optional
    await expect(dialog.getByLabel("Password")).toHaveAttribute(
      "placeholder",
      "Leave blank to keep unchanged",
    );

    // Fill in a new password and save
    await dialog.getByLabel("Password").fill("newpassword123!");
    await dialog.getByRole("button", { name: "Save" }).click();

    // Wait for dialog to close, confirming success
    await expect(dialog).not.toBeVisible();

    // User should still be in the table
    await expect(
      page.getByRole("row").filter({ hasText: uniqueEmail }),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Delete user
  // -------------------------------------------------------------------------
  test("should delete a user and remove them from the table", async ({
    page,
  }) => {
    const ts = Date.now();
    const uniqueEmail = `delete-${ts}@test.com`;
    const userName = `Delete Target ${ts}`;

    // Create the user first
    await createUserViaUI(page, {
      name: userName,
      email: uniqueEmail,
      password: "securepassword1!",
    });

    // Verify user exists before deletion
    await expect(
      page.getByRole("row").filter({ hasText: uniqueEmail }),
    ).toBeVisible();

    // Click the delete button for the created user
    await page.getByRole("button", { name: `Delete ${userName}` }).click();

    // Confirm the delete dialog
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Delete User")).toBeVisible();
    await expect(dialog.getByText(userName)).toBeVisible();

    await dialog.getByRole("button", { name: "Delete" }).click();

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible();

    // Verify the user row is removed from the table
    await expect(
      page.getByRole("row").filter({ hasText: uniqueEmail }),
    ).not.toBeVisible();
  });
});
