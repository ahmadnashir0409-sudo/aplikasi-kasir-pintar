import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export function createDatabase(connectionString: string) {
  // Hyperdrive owns the long-lived origin pool. Keep this client scoped to
  // the current Worker invocation and let Hyperdrive reuse origin connections.
  const client = postgres(connectionString, {
    max: 5,
    prepare: true,
    fetch_types: false,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: {
      application_name: "Cloudflare Hyperdrive",
    },
  });

  return { db: drizzle(client, { schema }), client };
}
