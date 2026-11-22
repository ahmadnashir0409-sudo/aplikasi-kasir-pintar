# WARUNG PINTAR

A rebuild of the WARUNG PINTAR point-of-sale prototype into a reliable, multi-user PWA backed by PostgreSQL.

## Stack

- React + TypeScript + Vite (web)
- Hono + Cloudflare Workers (API)
- PostgreSQL + Drizzle ORM (data)
- Neon PostgreSQL (planned managed host)
- Cloudflare Hyperdrive (planned production database connectivity)

## Requirements

- Node.js 22+
- npm 10+
- Docker (for local PostgreSQL)

## Local development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL locally: `docker compose up -d db`.
3. Install dependencies: `npm install`.
4. Start the web app: `npm run dev`.
5. In another terminal, start the API: `npm run dev:api`.

Web: http://localhost:5173  
API health: http://localhost:8787/health

## Commands

- `npm run build` — production web build and API typecheck
- `npm run typecheck` — typecheck web and API
- `npm test` — API tests
- `npm run format:check` — formatting check

## Database

PostgreSQL is the selected database engine. Neon is the planned managed provider. Do not commit database URLs or credentials. Schema changes must be made through versioned SQL migrations in `apps/api/drizzle/`.

## Current status

Phase 1 foundation scaffold. Authentication and store-scoped authorization are next; production database provisioning has not been performed.
