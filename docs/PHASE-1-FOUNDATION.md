# Phase 1 — Foundation

## Implemented in this scaffold
- Monorepo workspace for web and API.
- React + TypeScript + Vite web entry point.
- Hono API entry point with health endpoint and safe error response.
- PostgreSQL local development service through Docker Compose.
- Initial tenant/store schema migration.
- Typecheck, test, build, formatting scripts.
- GitHub Actions CI workflow.
- Environment example and secret exclusions.

## Deployment note
The API currently runs locally through Wrangler. Before production deployment, provision Neon PostgreSQL and configure Cloudflare Hyperdrive with managed secrets/bindings. Never commit database credentials.

The initial migration is a development baseline only. Do not run it against an existing production database. Later migrations add users, memberships, products, inventory, sales, payments, cash sessions, and audit records.

## Next
1. Add Neon connectivity via Hyperdrive and Drizzle schema/client.
2. Add migration tooling and migration verification.
3. Implement password hashing, login, secure server-side sessions, logout, and role/store authorization.
4. Add API integration tests using disposable PostgreSQL.
