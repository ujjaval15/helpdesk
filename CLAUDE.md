# Helpdesk — AI-Powered Ticket Management System

## Project Overview

A ticket management system that uses AI (Claude API) to automatically classify, respond to, and route support tickets. Two user roles: Admin and Agent. See [implementation-plan.md](implementation-plan.md) for the phased task breakdown.

> **Status:** Authentication (Better Auth email/password + roles) and the login/protected-home shell are implemented. Ticket models, AI classification, and email are still planned — see [implementation-plan.md](implementation-plan.md).

## Project Structure

```
helpdesk/
├── client/          # React 19 + TypeScript (Vite)
│   └── src/
│       ├── components/
│       │   ├── NavBar.tsx          # avatar + sign-out dropdown (shown when authed)
│       │   ├── ProtectedRoute.tsx  # redirects to /login when no session
│       │   └── ui/                 # shadcn components (Base UI primitives)
│       ├── lib/
│       │   ├── auth-client.ts      # Better Auth React client
│       │   └── utils.ts            # cn() class merge helper
│       ├── pages/
│       │   ├── Home.tsx            # protected landing + server health check
│       │   └── LoginPage.tsx       # email/password form (react-hook-form + zod)
│       ├── App.tsx                 # React Router routes
│       └── main.tsx
├── server/          # Express 5 + TypeScript (Bun runtime)
│   ├── src/
│   │   ├── app.ts                  # Express app, CORS, route wiring
│   │   ├── index.ts                # entrypoint (imports app)
│   │   ├── db.ts                   # Prisma client (pg adapter)
│   │   ├── lib/auth.ts             # Better Auth config
│   │   ├── middleware/requireAuth.ts   # session check → 401
│   │   ├── middleware/requireAdmin.ts  # role check → 403 (use after requireAuth)
│   │   ├── types/express.d.ts      # augments Request with user/session
│   │   └── generated/prisma/       # generated Prisma client (output dir)
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts                 # seeds the admin user from env
│   └── .env.example               # env var template (no real secrets)
├── docker/
│   └── init-test-db.sql       # creates helpdesk_test DB on first docker start
├── e2e/                       # Playwright E2E tests
│   └── global-setup.ts        # pushes schema + seeds test DB before tests
├── playwright.config.ts       # Playwright config (test server on port 3001)
├── docker-compose.yml
├── project-scope.md
├── tech-stack.md
└── implementation-plan.md
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, react-hook-form + zod, shadcn/ui (built on **Base UI**, not Radix), lucide-react
- **Backend:** Express 5, TypeScript, Bun runtime, helmet, express-rate-limit
- **Auth:** Better Auth (email/password, database sessions)
- **Database:** PostgreSQL (via Docker), Prisma ORM (`@prisma/adapter-pg`)
- **AI:** Claude API (Anthropic) — planned
- **Email:** SendGrid or Mailgun — planned

## Running the App

```bash
# Start PostgreSQL
docker compose up -d

# Terminal 1 — Server (port 3000)
cd server && bun run dev

# Terminal 2 — Client (port 5173)
cd client && bun dev

# One-time: create the admin user (reads ADMIN_EMAIL / ADMIN_PASSWORD from server/.env)
cd server && bun run db:seed
```

## Key Commands

### Server
- `bun run dev` — start with hot reload (`bun --hot`)
- `bun run start` — start without hot reload
- `bun run db:migrate` — run Prisma migrations (`prisma migrate dev`)
- `bun run db:push` — push schema without a migration
- `bun run db:generate` — regenerate Prisma client
- `bun run db:studio` — open Prisma Studio
- `bun run db:seed` — seed the admin user

### Client
- `bun dev` — start Vite dev server
- `bun run build` — type-check + production build
- `bun run preview` — preview the production build
- `bun run lint` — run ESLint

### E2E Tests (from project root)
- `bun run test:e2e` — run Playwright tests (headless)
- `bun run test:e2e:headed` — run with browser visible
- `bun run test:e2e:ui` — open Playwright UI mode

## E2E Testing

Playwright is configured at the project root with a **separate test database** (`helpdesk_test`) so tests never touch dev data.

- **Test DB:** `helpdesk_test` on the same Postgres container (port 5432). Created automatically via `docker/init-test-db.sql` on first `docker compose up`. For existing containers, run: `docker exec helpdesk-db-1 psql -U postgres -c "CREATE DATABASE helpdesk_test;"`.
- **Test server:** Runs on port **3001** (not 3000) with env vars defined in `playwright.config.ts`. The client Vite dev server still runs on 5173.
- **Global setup** (`e2e/global-setup.ts`): Pushes the Prisma schema to the test DB and seeds the admin user (`admin@test.com` / `testpassword123!`) before tests run.
- **Config reference:** `server/.env.test` documents the test env vars (not loaded automatically — the Playwright config passes them via `webServer.env`).
- Tests go in `e2e/` with the `.spec.ts` extension.

## Authentication

Auth is handled by **Better Auth** with email/password and database-backed sessions.

### Server (`server/src/lib/auth.ts`)
- `emailAndPassword.enabled: true` with **`disableSignUp: true`** — there is no public sign-up; users are created via the seed script / admin only.
- Prisma adapter (`prismaAdapter(prisma, { provider: "postgresql" })`).
- Custom user field **`role`** (`type: "string"`, `defaultValue: "agent"`), mirrored on the client.
- **Sessions time out after 5 minutes:** `session: { expiresIn: 60 * 5, updateAge: 0 }`. `updateAge: 0` refreshes the expiry on every authenticated request, so active users stay signed in while an idle session is invalidated after 5 minutes.
- `trustedOrigins` is set from `CLIENT_URL` (defaults to `http://localhost:5173`).
- Handler mounted in `app.ts` via `app.all("/api/auth/*splat", toNodeHandler(auth))` — **before** `express.json()` so Better Auth can read raw request bodies.
- CORS is configured with `credentials: true` and `origin: CLIENT_URL` so session cookies flow cross-origin in dev.
- **Security headers:** `helmet` is applied before CORS (`app.use(helmet())`), adding `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, etc.
- **Rate limiting:** `express-rate-limit` limits `/api/auth/sign-in` to 10 requests per 15-minute window per IP. **Only enabled in production** (`NODE_ENV=production`). Applied before the Better Auth handler.

### Protecting routes (`server/src/middleware/`)
- **`requireAuth`** calls `auth.api.getSession({ headers })`, returns **401** if there is no session, otherwise attaches `req.user` and `req.session` (types augmented in `server/src/types/express.d.ts` via `auth.$Infer.Session`).
- **`requireAdmin`** checks `req.user.role === "admin"`, returns **403** if not. Must be chained **after** `requireAuth`.
- Example usage: `app.get("/api/me", requireAuth, ...)` or `app.get("/api/admin/users", requireAuth, requireAdmin, ...)`.

### Client (`client/src/lib/auth-client.ts`)
- `createAuthClient` from `better-auth/react`; exports `signIn`, `signOut`, `useSession`.
- `inferAdditionalFields` mirrors the server's `role` field so it is typed on `session.user`.
- baseURL defaults to the current origin; the Vite proxy forwards `/api` to the server, keeping requests same-origin so cookies just work.
- `ProtectedRoute.tsx` shows a loading state while `useSession()` is pending, then redirects to `/login` if there is no session.
- `LoginPage.tsx` validates with zod, calls `signIn.email(...)`, and redirects authenticated users away from the form.
- `NavBar.tsx` renders the user avatar + a dropdown (name, email, **Sign out**); `signOut()` then navigates to `/login`.

### Seeding the admin (`server/prisma/seed.ts`)
- Reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`.
- **Rejects passwords shorter than 12 characters** before proceeding.
- Creates a user with `role: admin` and links a `credential` account with a hashed password via `auth.$context`. Skips if the user already exists.

### Creating additional users
- Public sign-up is disabled (`disableSignUp: true`), so agents and other users must be created server-side using the same pattern as the seed script: hash the password with `ctx.password.hash(...)`, create the user via `ctx.internalAdapter.createUser({ role, ... })`, then `ctx.internalAdapter.linkAccount({ userId, providerId: "credential", accountId: userId, password: hash })` (where `ctx = await auth.$context`).
- Example seeded agent: `agent@example.com` (`role: agent`).

### Invalidating sessions
- Sessions live in the `session` table. To force-logout everyone (e.g. after changing the timeout), clear it: `bunx prisma db execute --stdin <<< 'DELETE FROM "session";'`.

## Database

- Prisma schema at `server/prisma/schema.prisma`; generated client output to `server/src/generated/prisma`.
- `DATABASE_URL` configured in `server/.env`; connection uses the `pg` adapter (`server/src/db.ts`).
- **Current models:** `User`, `Session`, `Account`, `Verification` (the Better Auth schema).
- **Current enum:** `Role` — values `admin`, `agent` (lowercase).
- **Planned (not yet in schema):** `Ticket` model with `TicketStatus` (OPEN, RESOLVED, CLOSED) and `TicketCategory` (GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST) — see [implementation-plan.md](implementation-plan.md).

## Environment Variables (`server/.env`)

- `PORT` — server port (default 3000)
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Better Auth signing secret
- `BETTER_AUTH_URL` — Better Auth base URL (e.g. `http://localhost:3000`)
- `CLIENT_URL` — allowed CORS origin / trusted origin (e.g. `http://localhost:5173`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials used by the seed script (password must be 12+ characters)

See `server/.env.example` for a template with all required variables.

## API

- Base URL: `http://localhost:3000`; all endpoints prefixed with `/api`.
- Client proxies `/api` requests to the server via `client/vite.config.ts`.
- Current endpoints:
  - `ALL /api/auth/*` — Better Auth (sign-in, sign-out, get-session, etc.)
  - `GET /api/health` — `{ status: "ok" }`
  - `GET /api/me` — current user + session (requires auth, 401 otherwise). Session token is stripped from the response.

## Documentation

Use the context7 MCP server to fetch up-to-date documentation for any library used in this project (React, Express, Prisma, Vite, Tailwind CSS, React Router, Better Auth, Base UI, etc.). Always prefer context7 over relying on training data for library-specific syntax, configuration, or APIs.
