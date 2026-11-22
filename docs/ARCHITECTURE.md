# WARUNG PINTAR — Rebuild Architecture

Status: Architecture baseline v1
Branch: rebuild/architecture
Date: 2026-11-22

## 1. Goals

Rebuild the prototype as a reliable, multi-user point-of-sale application. Preserve the product identity and useful UX concepts, but do not carry over hard-coded demo figures or fragile in-memory business logic.

Non-goals for the first release: accounting ERP complexity, marketplace integrations, loyalty points, and multi-branch consolidation beyond the tenant-safe foundations.

## 2. Selected stack

- Frontend: React + TypeScript + Vite.
- UI: responsive component system; mobile-first.
- PWA: installable app, service worker, offline read cache, and an explicit pending-operation queue.
- API: Hono on Cloudflare Workers.
- Database: PostgreSQL (proposed managed host: Neon).
- Database access: Drizzle ORM + versioned SQL migrations.
- Edge/database connectivity: Cloudflare Hyperdrive, subject to compatibility validation with the selected PostgreSQL driver.
- Authentication: server-managed sessions, secure password hashing, session rotation, and role-based authorization.
- Tests: unit tests for domain logic, API integration tests against PostgreSQL, and end-to-end tests for checkout and close-of-day.

Neon is a proposed hosting choice, not yet provisioned. The user selected PostgreSQL as the database engine; hosting credentials must never be committed to Git.

## 3. High-level architecture

Browser/PWA -> HTTPS API (Hono / Cloudflare Workers) -> domain services -> Drizzle -> PostgreSQL.

The browser must never connect directly to PostgreSQL. All business rules and privileged writes run on the API.

Offline mode is deliberately constrained: catalog and selected reference data may be cached; sales are stored as clearly marked pending operations with stable idempotency keys and are synchronized only through the API. The UI must never claim a pending sale is finalized until the server confirms it.

## 4. Initial domain modules

1. Identity and access: users, roles, sessions.
2. Tenant and store: stores and memberships; every business record is scoped to a store.
3. Catalog: products, categories, units, prices, and active status.
4. Inventory: stock balances and immutable stock movements.
5. POS: sales, sale items, payments, voids/refunds.
6. Cash management: cash sessions, cash movements, cash counts.
7. Close of day: immutable closing snapshots and reconciliation.
8. Reporting: derived from finalized server-side records, not hard-coded chart arrays.
9. Audit: actor, action, entity, timestamp, and safe metadata.

## 5. Initial relational model

- tenants(id, name, created_at)
- stores(id, tenant_id, name, timezone, currency, created_at)
- users(id, email, password_hash, display_name, status, created_at)
- memberships(id, tenant_id, store_id, user_id, role, created_at)
- categories(id, store_id, name, created_at)
- products(id, store_id, category_id, sku, barcode, name, unit, cost_price, sell_price, is_active, created_at, updated_at)
- inventory_balances(id, store_id, product_id, quantity, updated_at)
- inventory_movements(id, store_id, product_id, movement_type, quantity_delta, unit_cost, reference_type, reference_id, actor_id, created_at)
- sales(id, store_id, receipt_number, status, subtotal, discount_total, grand_total, idempotency_key, cashier_id, finalized_at, created_at)
- sale_items(id, sale_id, product_id, product_name_snapshot, sku_snapshot, quantity, unit_price, unit_cost_snapshot, discount_total, line_total)
- payments(id, sale_id, method, amount, reference, created_at)
- cash_sessions(id, store_id, opened_by, opening_amount, opened_at, closed_by, closing_amount, closed_at, status)
- cash_movements(id, cash_session_id, movement_type, amount, note, actor_id, created_at)
- daily_closings(id, store_id, business_date, cash_session_id, sales_total, cash_expected, cash_counted, cash_difference, closed_by, closed_at, snapshot_json)
- audit_logs(id, store_id, actor_id, action, entity_type, entity_id, metadata_json, created_at)

All IDs use UUIDs. Money uses integer minor units (IDR rupiah as integer) rather than floating point. Quantities use NUMERIC with explicit precision. Timestamps are stored in UTC; store timezone determines business date.

## 6. Non-negotiable business invariants

- A finalized sale, its items, payment records, stock movements, and cash movements are committed in one PostgreSQL transaction.
- Checkout validates active products, price snapshots, available stock, payment totals, and the active cash session on the server.
- Inventory balance changes and inventory movement creation happen atomically. Movement history is append-only; corrections use compensating movements.
- Sale creation is idempotent. Retrying a request cannot create a duplicate sale.
- A finalized sale is not hard-deleted. Voids/refunds are explicit compensating workflows with authorization and audit history.
- Product names, SKU, unit price, and unit cost are snapshotted on sale items so historical receipts remain stable.
- Revenue, gross profit, cash balance, and net profit are distinct metrics. Sales total must never be labelled as profit.
- Daily closing creates an immutable snapshot. It does not reset historical sales or delete movements.
- Every query and mutation is scoped to the authorized store. Tenant/store scope is enforced in API services and database constraints where practical.

## 7. Delivery phases

### Phase 0 — Repository baseline (current)
- Keep the existing prototype intact on main.
- Create a dedicated rebuild branch.
- Record architecture and business invariants.
- No production database or existing business data is changed.

### Phase 1 — Foundation
- Scaffold frontend and API workspaces.
- Add environment validation, linting, formatting, tests, and CI.
- Add PostgreSQL schema and migrations.
- Add health endpoint and database connectivity checks.
- Add authentication and store-scoped authorization.

### Phase 2 — Catalog and inventory
- Product/category CRUD.
- Stock balance and immutable movement ledger.
- Opening stock, purchase/restock, adjustment, and stock opname flows.

### Phase 3 — POS and payments
- Cart, price snapshot, discounts, payment methods, change calculation.
- Atomic checkout and idempotency.
- Receipt history, void/refund workflows.

### Phase 4 — Cash management and daily close
- Open/close cash session.
- Cash in/out.
- Expected vs counted cash and discrepancy tracking.
- Immutable daily closing snapshots.

### Phase 5 — Reporting and PWA
- Sales, gross profit, inventory, cashier, and closing reports.
- Offline catalog cache and pending-sale synchronization.
- Backup/restore drills, security review, and production readiness.

## 8. Acceptance criteria

- Refreshing or signing in from another device does not lose finalized data.
- Two cashiers cannot oversell the same remaining stock through concurrent checkout.
- Retrying checkout with the same idempotency key creates exactly one sale.
- A failed checkout leaves no partial payment, sale, stock, or cash records.
- Historical receipts do not change when product names or prices are edited.
- Closing is reproducible from stored records and never erases the source transactions.
- Unauthorized users cannot read or mutate another store's records.
- Offline pending sales are visibly pending and reconcile safely after reconnection.

## 9. Open deployment decision

Use Neon as the initial managed PostgreSQL candidate and Cloudflare Workers for API/static delivery. Confirm account availability, region/latency, free-tier limits, backup expectations, and Hyperdrive/driver compatibility before provisioning production. Keep local development on PostgreSQL via Docker.

No secrets, database URLs, or production credentials belong in this repository.
