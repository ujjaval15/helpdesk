import { test, expect } from "@playwright/test";

const TEST_EMAIL = "admin@test.com";
const TEST_PASSWORD = "testpassword123!";

/**
 * Helper: sign in via the login form.
 */
async function loginViaUI(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/**
 * Helper: sign in via the API and persist cookies so subsequent navigations
 * are already authenticated.
 */
async function loginViaAPI(page: import("@playwright/test").Page) {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
}

// ---------------------------------------------------------------------------
// Login page — form rendering
// ---------------------------------------------------------------------------
test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display the login form with all expected elements", async ({
    page,
  }) => {
    // CardTitle renders a <div>, not a heading element
    await expect(page.getByText("Helpdesk", { exact: true })).toBeVisible();
    await expect(page.getByText("Sign in to your account")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // Client-side validation (zod + react-hook-form)
  // -------------------------------------------------------------------------
  test.describe("Client-side validation", () => {
    test("should show required errors when submitting an empty form", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByText("Email is required")).toBeVisible();
      await expect(page.getByText("Password is required")).toBeVisible();

      // Should stay on the login page — no navigation
      await expect(page).toHaveURL(/\/login/);
    });

    test("should show required error for email when only password is filled", async ({
      page,
    }) => {
      await page.getByLabel("Password").fill("some-password");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByText("Email is required")).toBeVisible();
      await expect(page.getByText("Password is required")).not.toBeVisible();
    });

    test("should show required error for password when only email is filled", async ({
      page,
    }) => {
      await page.getByLabel("Email").fill("user@example.com");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByText("Password is required")).toBeVisible();
      await expect(page.getByText("Email is required")).not.toBeVisible();
    });

    test("should show invalid email error for a malformed email", async ({
      page,
    }) => {
      await page.getByLabel("Email").fill("not-an-email");
      await page.getByLabel("Password").fill("some-password");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByText("Enter a valid email")).toBeVisible();
    });

    test("should show invalid email error for email without domain", async ({
      page,
    }) => {
      await page.getByLabel("Email").fill("user@");
      await page.getByLabel("Password").fill("password");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByText("Enter a valid email")).toBeVisible();
    });

    test("should set aria-invalid on fields with validation errors", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByLabel("Email")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(page.getByLabel("Password")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  // -------------------------------------------------------------------------
  // Server-side authentication errors
  // -------------------------------------------------------------------------
  test.describe("Server-side authentication", () => {
    test("should show error for wrong password", async ({ page }) => {
      await loginViaUI(page, TEST_EMAIL, "wrongpassword!!");

      await expect(page.getByText("Invalid email or password")).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    });

    test("should show error for non-existent email", async ({ page }) => {
      await loginViaUI(page, "nobody@example.com", "somepassword123!");

      await expect(page.getByText("Invalid email or password")).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    });

    test("should show the signing-in state while the request is in flight", async ({
      page,
    }) => {
      await page.getByLabel("Email").fill(TEST_EMAIL);
      await page.getByLabel("Password").fill(TEST_PASSWORD);

      // Slow down the auth response so we can observe the loading state
      await page.route("**/api/auth/sign-in/email", async (route) => {
        await new Promise((r) => setTimeout(r, 500));
        await route.continue();
      });

      await page.getByRole("button", { name: "Sign in" }).click();

      // The button should show "Signing in..." and be disabled
      const button = page.getByRole("button", { name: /signing in/i });
      await expect(button).toBeVisible();
      await expect(button).toBeDisabled();
    });

    test("should clear previous server error when re-submitting", async ({
      page,
    }) => {
      // First attempt — wrong password
      await loginViaUI(page, TEST_EMAIL, "wrongpassword!!");
      await expect(page.getByText("Invalid email or password")).toBeVisible();

      // Second attempt — correct password
      await page.getByLabel("Password").fill(TEST_PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();

      // The error should disappear while the new request is in flight
      await expect(
        page.getByText("Invalid email or password"),
      ).not.toBeVisible();
    });
  });

  // -------------------------------------------------------------------------
  // Successful login
  // -------------------------------------------------------------------------
  test.describe("Successful login", () => {
    test("should redirect to the home page after successful login", async ({
      page,
    }) => {
      await loginViaUI(page, TEST_EMAIL, TEST_PASSWORD);

      // Should navigate to the home page
      await expect(page).toHaveURL("/");
      await expect(
        page.getByRole("heading", { name: "Helpdesk" }),
      ).toBeVisible();
      await expect(page.getByText("Server status")).toBeVisible();
    });

    test("should display the NavBar with user info after login", async ({
      page,
    }) => {
      await loginViaUI(page, TEST_EMAIL, TEST_PASSWORD);
      await expect(page).toHaveURL("/");

      // The avatar button should be visible in the NavBar
      // The avatar shows initials derived from the user name
      const avatarButton = page.getByRole("button").filter({
        has: page.locator("[class*='avatar']"),
      });
      await expect(avatarButton).toBeVisible();
    });
  });
});

// ---------------------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------------------
test.describe("Protected routes", () => {
  test("should redirect unauthenticated users from / to /login", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /users to /login", async ({
    page,
  }) => {
    await page.goto("/users");

    await expect(page).toHaveURL(/\/login/);
  });

  test("should show loading state while session is being checked", async ({
    page,
  }) => {
    // Slow down the session check so we can observe the loading state
    await page.route("**/api/auth/get-session", async (route) => {
      await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });

    await page.goto("/");

    await expect(page.getByText("Loading…")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Session persistence
// ---------------------------------------------------------------------------
test.describe("Session persistence", () => {
  test("should stay authenticated after page reload", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await loginViaUI(page, TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/");

    // Reload the page
    await page.reload();

    // Should still be on the home page, not redirected to login
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Helpdesk" }),
    ).toBeVisible();
    await expect(page.getByText("Server status")).toBeVisible();
  });

  test("should stay authenticated when navigating between pages", async ({
    page,
  }) => {
    await page.goto("/login");
    await loginViaUI(page, TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/");

    // Navigate to login page URL directly — should redirect back since
    // LoginPage does <Navigate to="/" /> when already authenticated
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});

// ---------------------------------------------------------------------------
// Already-authenticated redirect
// ---------------------------------------------------------------------------
test.describe("Already authenticated redirect", () => {
  test("should redirect from /login to / when already signed in", async ({
    page,
  }) => {
    // Sign in first
    await page.goto("/login");
    await loginViaUI(page, TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/");

    // Navigate to /login — should immediately redirect
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("should redirect from /login to / when authenticated via API", async ({
    page,
  }) => {
    await loginViaAPI(page);

    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
test.describe("Sign out", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await loginViaUI(page, TEST_EMAIL, TEST_PASSWORD);
    await expect(page).toHaveURL("/");
  });

  test("should sign out and redirect to /login", async ({ page }) => {
    // Open the user dropdown menu by clicking the avatar button
    const avatarButton = page.getByRole("button").filter({
      has: page.locator("[class*='avatar']"),
    });
    await avatarButton.click();

    // Click sign out
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should not be able to access protected routes after sign out", async ({
    page,
  }) => {
    // Sign out
    const avatarButton = page.getByRole("button").filter({
      has: page.locator("[class*='avatar']"),
    });
    await avatarButton.click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Try accessing the home page directly
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display user name and email in the dropdown menu", async ({
    page,
  }) => {
    const avatarButton = page.getByRole("button").filter({
      has: page.locator("[class*='avatar']"),
    });
    await avatarButton.click();

    // The dropdown should show the user email
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// API-level auth check
// ---------------------------------------------------------------------------
test.describe("API authentication", () => {
  test("should return 401 for /api/me when not authenticated", async ({
    request,
  }) => {
    const response = await request.get("/api/me");
    expect(response.status()).toBe(401);
  });

  test("should return user data for /api/me when authenticated", async ({
    page,
  }) => {
    // Authenticate via API to get session cookies
    await loginViaAPI(page);

    const response = await page.request.get("/api/me");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(TEST_EMAIL);
    expect(data.user.role).toBe("admin");
  });
});
