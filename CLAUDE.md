# Helpdesk — AI-Powered Ticket Management System

## Project Overview

A ticket management system that uses AI (Claude API) to automatically classify, respond to, and route support tickets. Two user roles: Admin and Agent. See [implementation-plan.md](implementation-plan.md) for the phased task breakdown.

## Project Structure

```
helpdesk/
├── client/          # React + TypeScript (Vite)
├── server/          # Express + TypeScript (Bun)
├── docker-compose.yml
├── project-scope.md
├── tech-stack.md
└── implementation-plan.md
```

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, React Router, Vite
- **Backend:** Node.js, Express, TypeScript, Bun runtime
- **Database:** PostgreSQL (via Docker), Prisma ORM
- **AI:** Claude API (Anthropic)
- **Email:** SendGrid or Mailgun

## Running the App

```bash
# Start PostgreSQL
docker compose up -d

# Terminal 1 — Server (port 3000)
cd server && bun run dev

# Terminal 2 — Client (port 5173)
cd client && bun dev
```

## Key Commands

### Server
- `bun run dev` — start with hot reload
- `bun run db:migrate` — run Prisma migrations
- `bun run db:studio` — open Prisma Studio
- `bun run db:generate` — regenerate Prisma client

### Client
- `bun dev` — start Vite dev server
- `bun run build` — production build
- `bun run lint` — run ESLint

## Database

- Prisma schema at `server/prisma/schema.prisma`
- DATABASE_URL configured in `server/.env`
- Enums: `Role` (ADMIN, AGENT), `TicketStatus` (OPEN, RESOLVED, CLOSED), `TicketCategory` (GENERAL_QUESTION, TECHNICAL_QUESTION, REFUND_REQUEST)

## API

- Base URL: `http://localhost:3000`
- All endpoints prefixed with `/api`
- Client proxies `/api` requests to the server via Vite config

## Documentation

Use context7 MCP server to fetch up-to-date documentation for any library used in this project (React, Express, Prisma, Vite, Tailwind CSS, React Router, etc.). Always prefer context7 over relying on training data for library-specific syntax, configuration, or APIs.
