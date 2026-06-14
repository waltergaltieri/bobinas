import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { readServerEnv } from "@/lib/env";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let client: postgres.Sql | null = null;
let db: Database | null = null;

export function hasDatabaseUrl() {
  return Boolean(readServerEnv().databaseUrl);
}

export function getDb() {
  const databaseUrl = readServerEnv().databaseUrl;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database operations.");
  }

  if (!client) {
    client = postgres(databaseUrl, {
      prepare: false,
    });
  }

  if (!db) {
    db = drizzle(client, { schema });
  }

  return db;
}

export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}
