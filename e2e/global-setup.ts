import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "../server");

const testEnv = {
  ...process.env,
  DATABASE_URL:
    "postgresql://postgres:postgres@localhost:5432/helpdesk_test?schema=public",
  BETTER_AUTH_SECRET: "test-secret-do-not-use-in-production-1234567890",
  ADMIN_EMAIL: "admin@test.com",
  ADMIN_PASSWORD: "testpassword123!",
};

export default function globalSetup() {
  execSync("bunx prisma db push", {
    cwd: serverDir,
    stdio: "inherit",
    env: testEnv,
  });

  execSync("bun run db:seed", {
    cwd: serverDir,
    stdio: "inherit",
    env: testEnv,
  });
}
