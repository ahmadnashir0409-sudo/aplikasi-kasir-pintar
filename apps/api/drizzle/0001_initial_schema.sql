-- Initial baseline for a new development database only.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK(length(trim(name))>0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK(length(trim(name))>0),
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  currency CHAR(3) NOT NULL DEFAULT 'IDR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,id)
);
--> statement-breakpoint
CREATE INDEX stores_tenant_id_idx ON stores(tenant_id);
