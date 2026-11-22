# WARUNG PINTAR

A rebuild of the WARUNG PINTAR point-of-sale prototype into a reliable, multi-user PWA backed by PostgreSQL.

## Stack

- React + TypeScript + Vite (web)
- Hono + Cloudflare Workers (API)
- PostgreSQL + Drizzle ORM (data)
- Neon PostgreSQL (selected managed host)
- Cloudflare Hyperdrive (planned production database connectivity)

## Requirements

- Node.js 22+
- npm 10+
- Docker (for local PostgreSQL)

## Local development

1. Start PostgreSQL locally: `docker compose up -d db`.
2. Install dependencies: `npm install`.
3. Set `DATABASE_URL` in your shell or copy `apps/api/.env.example` to your local environment for Drizzle Kit.
4. For the Worker, copy `apps/api/.dev.vars.example` to `apps/api/.dev.vars`.
5. Start the API: `npm run dev:api`.
6. In another terminal, start the web app: `npm run dev`.

Web: http://localhost:5173  
API health: http://localhost:8787/health  
Database readiness: http://localhost:8787/health/db

## Commands

- `npm run build` — production web build and API typecheck
- `npm run typecheck` — typecheck web and API
- `npm test` — API tests
- `npm run format:check` — formatting check
- `npm run db:migrate --workspace @warung-pintar/api` — apply local SQL migrations after reviewing them

## Database

PostgreSQL is the selected database engine. Neon is the selected managed provider. Do not commit database URLs or credentials. Schema changes must be made through versioned SQL migrations in `apps/api/drizzle/`.

## Current status

Phase 1 foundation scaffold. Database connectivity checks and identity schema are present; hosted Neon provisioning and full authentication flows are not complete.
