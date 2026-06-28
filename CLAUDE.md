# Helpdesk — AI-Powered Ticket Management System

## Project Overview

A ticket management system that uses AI (Claude API) to automatically classify, respond to, and route support tickets. Two user roles: Admin and Agent. See [implementation-plan.md](implementation-plan.md) for the phased task breakdown.

> **Status:** Authentication, user management, and ticket ingestion (inbound email webhook + ticket listing with filtering) are implemented. AI classification and email provider integration are still planned — see [implementation-plan.md](implementation-plan.md).

## Project Structure

```
helpdesk/
├── client/          # React 19 + TypeScript (Vite)
│   └── src/
│       ├── components/
│       │   ├── NavBar.tsx          # avatar + sign-out dropdown (shown when authed)
│       │   ├── ProtectedRoute.tsx  # redirects to /login when no session
│       │   ├── TicketsTable.tsx    # ticket list table + Ticket type + enums
│       │   └── ui/                 # shadcn components (Base UI primitives)
│       ├── lib/
│       │   ├── auth-client.ts      # Better Auth React client
│       │   └── utils.ts            # cn() class merge helper
│       ├── pages/
│       │   ├── Home.tsx            # protected landing + server health check
│       │   ├── LoginPage.tsx       # email/password form (react-hook-form + zod)
│       │   └── Tickets.tsx         # ticket list with status/category filters
│       ├── App.tsx                 # React Router routes
│       └── main.tsx
├── server/          # Express 5 + TypeScript (Bun runtime)
│   ├── src/
│   │   ├── app.ts                  # Express app, CORS, route wiring
│   │   ├── index.ts                # entrypoint (imports app)
│   │   ├── db.ts                   # Prisma client (pg adapter)
│   │   ├── lib/auth.ts             # Better Auth config
│   │   ├── routes/users.ts         # /api/admin/users — CRUD
│   │   ├── routes/tickets.ts       # /api/tickets — list + detail
│   │   ├── routes/inboundEmail.ts  # /api/webhooks/inbound-email — email→ticket
│   │   ├── middleware/requireAuth.ts       # session check → 401
│   │   ├── middleware/requireAdmin.ts      # role check → 403 (use after requireAuth)
│   │   ├── middleware/requireWebhookSecret.ts  # x-webhook-secret header check
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

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, react-hook-form + zod, shadcn/ui (built on **Base UI**, not Radix), lucide-react, axios, TanStack React Query
- **Backend:** Express 5, TypeScript, Bun runtime, helmet, express-rate-limit, zod. Express 5 automatically handles rejected promises in async route handlers — do not wrap route logic in try/catch.
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

### Component / Unit Tests (from `client/`)
- `bun run test` — run all tests once
- `bun run test:watch` — run in watch mode

### E2E Tests (from project root)
- `bun run test:e2e` — run Playwright tests (headless)
- `bun run test:e2e:headed` — run with browser visible
- `bun run test:e2e:ui` — open Playwright UI mode

## Testing

### Testing Strategy
- **Prefer component/unit tests over E2E tests.** Validation logic, zod schemas, pure functions, UI rendering, and user interactions should all be covered by Vitest unit tests.
- **Use E2E tests only when the test genuinely requires a running server and database** — e.g., full request lifecycle, auth middleware, database-dependent logic like deduplication. Keep E2E tests minimal and focused.
- **Server-side logic unit tests** (zod schemas, helper functions) can be placed in `client/src/test/` and import directly from `server/src/` — Vitest can resolve cross-directory imports within the monorepo.
- Export zod schemas and pure helper functions from route modules so they can be unit tested without spinning up the server.

### Component / Unit Tests
- **Stack:** Vitest + React Testing Library + jsdom. Config in `client/vite.config.ts` (`test` block), setup file at `client/src/test/setup.ts`.
- **Test files:** Component tests go next to the component as `<Component>.test.tsx`. Server logic unit tests go in `client/src/test/` (e.g., `inbound-email.test.ts`).
- **Rendering:** Use `renderWithProviders()` from `client/src/test/render.tsx` — it wraps components in `QueryClientProvider` (retry disabled) and `MemoryRouter`. Use this for all component tests instead of bare `render()`.
- **Mocking:** Mock `axios` with `vi.mock("axios")` and mock `../lib/auth-client` to provide a session. Do not make real API calls in unit tests.
- **What to cover:** Loading states (skeletons), error states, empty states, rendered data, correct API endpoint calls, user interactions, validation schemas, and pure helper functions.

### E2E Tests
> Always use the `e2e-test-writer` agent (`.claude/agents/e2e-test-writer.md`) for creating or modifying Playwright tests. It has the full testing infrastructure details (test DB, global setup, credentials, config) and Playwright best practices.
> Only write E2E tests for flows that require a real server and database. Validation, rendering, and pure logic belong in unit tests.

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
- **Current models:** `User`, `Session`, `Account`, `Verification` (Better Auth schema), `Ticket`.
- **Enums:** `Role` (admin, agent), `TicketStatus` (OPEN, RESOLVED, CLOSED), `TicketCategory` (GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST).
- **Ticket model:** `id` (Int, autoincrement), `subject`, `body`, `status` (default OPEN), `category` (optional, nullable), `customerEmail`, `customerName`, `assignedAgentId` (optional FK to User, onDelete SetNull), timestamps. Indexed on status, category, assignedAgentId, customerEmail.
- **Client-side enums:** `TicketStatus`, `TicketCategory`, `statusLabel`, and `categoryLabel` are exported from `client/src/components/TicketsTable.tsx` — use these instead of hardcoding values.
- **Soft deletion:** `User` has an optional `deletedAt` field. Queries filter by `deletedAt: null` to exclude soft-deleted users. Admin users cannot be soft-deleted.

## Environment Variables (`server/.env`)

- `PORT` — server port (default 3000)
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Better Auth signing secret
- `BETTER_AUTH_URL` — Better Auth base URL (e.g. `http://localhost:3000`)
- `CLIENT_URL` — allowed CORS origin / trusted origin (e.g. `http://localhost:5173`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials used by the seed script (password must be 12+ characters)
- `WEBHOOK_SECRET` — shared secret for the inbound email webhook (`x-webhook-secret` header)

See `server/.env.example` for a template with all required variables.

## API

- Base URL: `http://localhost:3000`; all endpoints prefixed with `/api`.
- Client proxies `/api` requests to the server via `client/vite.config.ts`.
- **Route modules** live in `server/src/routes/` as Express routers, mounted in `app.ts` (e.g. `app.use("/api/admin/users", usersRouter)`). Keep `app.ts` for middleware/config; put endpoint logic in route modules.
- Current endpoints:
  - `ALL /api/auth/*` — Better Auth (sign-in, sign-out, get-session, etc.)
  - `GET /api/health` — `{ status: "ok" }`
  - `GET /api/me` — current user + session (requires auth, 401 otherwise). Session token is stripped from the response.
  - `GET /api/admin/users` — list all users (requires auth + admin role, 401/403 otherwise). Returns `{ users: [...] }` with id, name, email, role, createdAt, image.
  - `POST /api/admin/users` — create a new agent user (requires auth + admin role). Body: `{ name, email, password }`. Returns `{ user }` with 201, or `{ errors }` with 400 for validation, or `{ error }` with 409 for duplicate email.
  - `PATCH /api/admin/users/:id` — update a user (requires auth + admin role). Body: `{ name, email, password? }`. Password is optional — omit or send empty string to keep unchanged. Returns `{ user }` with 200, or 400/404/409 for validation/not found/duplicate email.
  - `DELETE /api/admin/users/:id` — soft-delete a user (requires auth + admin role). Sets `deletedAt` timestamp. Admin users cannot be deleted (403). Returns `{ success: true }` with 200, or 403/404.
  - `POST /api/webhooks/inbound-email` — create a ticket from an inbound email. Requires `x-webhook-secret` header (no session auth). Body: `{ from, fromName, subject, body }`. Normalizes subject whitespace and deduplicates against open tickets with same sender + subject. Returns `{ ticket: { id } }` with 201, or `{ ticket: { id }, existing: true }` with 200 for duplicates.
  - `GET /api/tickets` — list tickets (requires auth). Admin sees all, agent sees only assigned. Supports `?status=OPEN&category=GENERAL_QUESTION` query params for filtering, `?sortBy=createdAt&sortOrder=desc` for sorting, and `?page=1&pageSize=20` for pagination. Returns `{ tickets: [...], pagination: { page, pageSize, total, totalPages } }`. Default page size is 10 (max 100).
  - `GET /api/tickets/:id` — get ticket detail (requires auth). Includes assigned agent info. Agent can only view assigned tickets (403 otherwise).
  - `PATCH /api/tickets/:id` — update a ticket (requires auth). Body: `{ status?, category?, assignedAgentId? }`. Status must be a valid `TicketStatus` enum, category a valid `TicketCategory` or null. `assignedAgentId` is admin-only (403 for agents); validates agent exists, is not soft-deleted, and has `agent` role. Agents can only update tickets assigned to them. Returns `{ ticket }` with updated fields.

## Validation

- Use **zod** for request validation on both client and server.
- **Client:** react-hook-form with `zodResolver` for form validation. Use `<ErrorMessage error={errors.fieldName} />` from `@/components/ui/error-message` for field-level validation errors. Use `<AlertError message="..." />` from `@/components/ui/alert-error` for page-level and server error messages (supports optional `className` for spacing/weight). Do not write inline `<p>` tags for error display.
- **Server:** Define a zod schema per endpoint, validate with `validateBody(schema, req.body, res)` from `server/src/lib/route-utils.ts`, which returns parsed data or sends a 400 with field-level errors. Use `parseIntId(raw, res)` for numeric param parsing and `findTicketWithAccess(id, userId, isAdmin, res)` for ticket lookup + authorization.

## Data Fetching

- Use **axios** for all HTTP requests — never use `fetch` directly.
- Use **TanStack React Query** (`useQuery`, `useMutation`) for all server state in React components — never use `useEffect` + `useState` for data fetching.
- `QueryClientProvider` is set up in `client/src/main.tsx`.

## Documentation

Use the context7 MCP server to fetch up-to-date documentation for any library used in this project (React, Express, Prisma, Vite, Tailwind CSS, React Router, Better Auth, Base UI, etc.). Always prefer context7 over relying on training data for library-specific syntax, configuration, or APIs.
