import { defineConfig, devices } from "@playwright/test";

const TEST_SERVER_PORT = 3001;
const TEST_CLIENT_PORT = 5174;
const TEST_DB_URL =
  "postgresql://postgres:postgres@localhost:5432/helpdesk_test?schema=public";

const serverEnv = {
  PORT: String(TEST_SERVER_PORT),
  DATABASE_URL: TEST_DB_URL,
  BETTER_AUTH_SECRET: "test-secret-do-not-use-in-production-1234567890",
  BETTER_AUTH_URL: `http://localhost:${TEST_SERVER_PORT}`,
  CLIENT_URL: `http://localhost:${TEST_CLIENT_PORT}`,
  ADMIN_EMAIL: "admin@test.com",
  ADMIN_PASSWORD: "testpassword123!",
};

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${TEST_CLIENT_PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "bun --hot src/index.ts",
      cwd: "./server",
      url: `http://localhost:${TEST_SERVER_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      env: serverEnv,
    },
    {
      command: `bun dev -- --port ${TEST_CLIENT_PORT}`,
      cwd: "./client",
      url: `http://localhost:${TEST_CLIENT_PORT}`,
      reuseExistingServer: !process.env.CI,
      env: {
        VITE_API_TARGET: `http://localhost:${TEST_SERVER_PORT}`,
      },
    },
  ],
  globalSetup: "./e2e/global-setup.ts",
});
