import { sql } from "drizzle-orm";
import { foreignKey, pgEnum, pgTable, text, timestamp, uuid, char, uniqueIndex, index } from "drizzle-orm/pg-core";

export const membershipRole = pgEnum("membership_role", ["owner", "manager", "cashier"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  timezone: text("timezone").default("Asia/Jakarta").notNull(),
  currency: char("currency", { length: 3 }).default("IDR").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("stores_tenant_id_idx").on(table.tenantId),
  uniqueIndex("stores_tenant_id_id_idx").on(table.tenantId, table.id),
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_email_lower_idx").on(sql`lower(${table.email})`),
]);

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  storeId: uuid("store_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: membershipRole("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    name: "memberships_tenant_store_fk",
    columns: [table.tenantId, table.storeId],
    foreignColumns: [stores.tenantId, stores.id],
  }).onDelete("restrict"),
  uniqueIndex("memberships_store_user_idx").on(table.storeId, table.userId),
  index("memberships_user_id_idx").on(table.userId),
]);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("sessions_token_hash_idx").on(table.tokenHash),
  index("sessions_user_id_idx").on(table.userId),
]);
