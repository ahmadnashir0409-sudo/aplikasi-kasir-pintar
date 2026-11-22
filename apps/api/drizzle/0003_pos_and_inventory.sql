CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  sku TEXT,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  category TEXT NOT NULL DEFAULT 'Umum',
  unit TEXT NOT NULL DEFAULT 'pcs',
  cost_price BIGINT NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  selling_price BIGINT NOT NULL CHECK (selling_price > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_tenant_store_fk FOREIGN KEY (tenant_id, store_id)
    REFERENCES stores(tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT products_tenant_store_id_unique UNIQUE (tenant_id, store_id, id)
);
--> statement-breakpoint
CREATE UNIQUE INDEX products_store_sku_unique_idx
  ON products(store_id, lower(sku)) WHERE sku IS NOT NULL AND length(trim(sku)) > 0;
--> statement-breakpoint
CREATE INDEX products_store_active_name_idx ON products(store_id, is_active, name);
--> statement-breakpoint
CREATE TABLE cashier_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  cashier_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opening_cash BIGINT NOT NULL CHECK (opening_cash >= 0),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  closing_cash BIGINT CHECK (closing_cash >= 0),
  expected_cash BIGINT CHECK (expected_cash >= 0),
  notes TEXT,
  CONSTRAINT shifts_tenant_store_fk FOREIGN KEY (tenant_id, store_id)
    REFERENCES stores(tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT shifts_tenant_store_id_unique UNIQUE (tenant_id, store_id, id),
  CONSTRAINT shifts_close_consistency CHECK (
    (closed_at IS NULL AND closed_by IS NULL AND closing_cash IS NULL)
    OR (closed_at IS NOT NULL AND closed_by IS NOT NULL AND closing_cash IS NOT NULL)
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX cashier_shifts_one_open_per_cashier_idx
  ON cashier_shifts(store_id, cashier_user_id) WHERE closed_at IS NULL;
--> statement-breakpoint
CREATE INDEX cashier_shifts_store_opened_idx ON cashier_shifts(store_id, opened_at DESC);
--> statement-breakpoint
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  shift_id UUID NOT NULL,
  cashier_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  sale_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'voided', 'refunded')),
  subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
  discount BIGINT NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total BIGINT NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'debit_card', 'credit_card', 'transfer', 'qris', 'other')),
  amount_paid BIGINT NOT NULL CHECK (amount_paid >= total),
  change_amount BIGINT NOT NULL CHECK (change_amount = amount_paid - total),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sales_tenant_store_fk FOREIGN KEY (tenant_id, store_id)
    REFERENCES stores(tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT sales_shift_fk FOREIGN KEY (tenant_id, store_id, shift_id)
    REFERENCES cashier_shifts(tenant_id, store_id, id) ON DELETE RESTRICT,
  CONSTRAINT sales_tenant_store_id_unique UNIQUE (tenant_id, store_id, id),
  CONSTRAINT sales_store_number_unique UNIQUE (store_id, sale_number),
  CONSTRAINT sales_total_consistency CHECK (total = GREATEST(0, subtotal - discount))
);
--> statement-breakpoint
CREATE INDEX sales_store_created_idx ON sales(store_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX sales_shift_idx ON sales(shift_id);
--> statement-breakpoint
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  sale_id UUID NOT NULL,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  sku_snapshot TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  line_total BIGINT NOT NULL CHECK (line_total = quantity * unit_price),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sale_items_sale_fk FOREIGN KEY (tenant_id, store_id, sale_id)
    REFERENCES sales(tenant_id, store_id, id) ON DELETE RESTRICT,
  CONSTRAINT sale_items_product_fk FOREIGN KEY (tenant_id, store_id, product_id)
    REFERENCES products(tenant_id, store_id, id) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE INDEX sale_items_sale_idx ON sale_items(sale_id);
--> statement-breakpoint
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  store_id UUID NOT NULL,
  product_id UUID NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('opening', 'purchase', 'sale', 'adjustment', 'return', 'damage')),
  quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
  unit_cost BIGINT CHECK (unit_cost IS NULL OR unit_cost >= 0),
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_movements_product_fk FOREIGN KEY (tenant_id, store_id, product_id)
    REFERENCES products(tenant_id, store_id, id) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE INDEX inventory_movements_product_created_idx
  ON inventory_movements(product_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX inventory_movements_store_created_idx
  ON inventory_movements(store_id, created_at DESC);
