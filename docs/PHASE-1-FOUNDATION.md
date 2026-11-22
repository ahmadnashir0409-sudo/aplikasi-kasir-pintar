# Phase 1 — Foundation

## Implemented in this scaffold

- Monorepo workspace for web and API.
- React + TypeScript + Vite web entry point.
- Hono API with liveness and PostgreSQL readiness endpoints.
- PostgreSQL local development service through Docker Compose.
- Drizzle schema for tenants, stores, users, memberships, and sessions.
- Versioned SQL migrations for tenant/store and identity/session foundations.
- Drizzle migration configuration and scripts.
- Typecheck, test, build, formatting scripts.
- GitHub Actions CI workflow.
- Environment example and secret exclusions.

## Database connectivity

The API accepts a local `DATABASE_URL` binding for development or a Cloudflare Hyperdrive binding for deployment. The `/health/db` endpoint reports readiness without exposing credentials or driver errors.

Neon is the selected managed PostgreSQL provider, but no Neon project has been provisioned and no production credentials have been added. Before production deployment, create the Neon database and configure Hyperdrive through the Cloudflare account. Never commit connection strings.

## Migration safety

The initial migration is a baseline for a new development database only. Do not run it against an existing production database. Apply migrations sequentially to a disposable local database first and verify the resulting schema before any hosted environment is considered.

## Next

1. Run install, typecheck, tests, and build in CI; fix any failures.
2. Provision a Neon development database and verify Hyperdrive/driver compatibility.
3. Add password hashing, login, secure server-side sessions, logout, and role/store authorization.
4. Add PostgreSQL integration tests for session and tenant/store isolation.
