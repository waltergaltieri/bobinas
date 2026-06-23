import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { readServerEnv } from "@/lib/env";

type Database = ReturnType<typeof drizzle<typeof schema>>;
type EnvSource = Record<string, string | undefined>;

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
    client = postgres(databaseUrl, getDatabaseClientOptions(process.env));
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

export function getDatabaseClientOptions(env: EnvSource) {
  return {
    prepare: false,
    max: readPositiveInteger(env.DATABASE_MAX_CONNECTIONS, 1),
    idle_timeout: readPositiveInteger(env.DATABASE_IDLE_TIMEOUT_SECONDS, 20),
  };
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
