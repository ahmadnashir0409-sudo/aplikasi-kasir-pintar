CREATE TYPE membership_role AS ENUM ('owner', 'manager', 'cashier');
--> statement-breakpoint
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));
--> statement-breakpoint
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT memberships_tenant_store_fk FOREIGN KEY (tenant_id, store_id)
    REFERENCES stores(tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT memberships_store_user_unique UNIQUE (store_id, user_id)
);
--> statement-breakpoint
CREATE INDEX memberships_user_id_idx ON memberships(user_id);
--> statement-breakpoint
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
