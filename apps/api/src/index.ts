import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { createDatabase } from "./db/client";

type Env = {
  Bindings: {
    APP_ENV?: string;
    DATABASE_URL?: string;
    HYPERDRIVE?: { connectionString: string };
  };
};

const app = new Hono<Env>();

app.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "warung-pintar-api",
    environment: c.env.APP_ENV ?? "development",
    timestamp: new Date().toISOString(),
  }),
);

app.get("/health/db", async (c) => {
  const connectionString = c.env.HYPERDRIVE?.connectionString ?? c.env.DATABASE_URL;
  if (!connectionString) {
    return c.json({ status: "not_configured", database: "postgresql" }, 503);
  }

  const { db, client } = createDatabase(connectionString);
  try {
    await db.execute(sql`select 1`);
    return c.json({ status: "ok", database: "postgresql" });
  } catch (error) {
    console.error("Database health check failed", error);
    return c.json({ status: "unavailable", database: "postgresql" }, 503);
  } finally {
    await client.end({ timeout: 1 });
  }
});

app.get("/api/health", (c) => c.redirect("/health", 308));

app.notFound((c) => c.json({ error: "NOT_FOUND", message: "Route tidak ditemukan." }, 404));

app.onError((error, c) => {
  console.error("Unhandled API error", error);
  return c.json(
    { error: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan pada server." },
    500,
  );
});

export default app;
