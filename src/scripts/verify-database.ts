import "./load-env";

import postgres from "postgres";

import { readServerEnv } from "@/lib/env";

const expectedTables = [
  "profiles",
  "categories",
  "products",
  "product_categories",
  "product_images",
  "product_import_metadata",
  "attributes",
  "attribute_options",
  "product_attribute_values",
  "purchase_requests",
  "purchase_request_items",
  "home_slides",
  "popup_settings",
  "product_views",
  "search_logs",
];

async function main() {
  const databaseUrl = readServerEnv().databaseUrl;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to verify the database.");
  }

  const db = postgres(databaseUrl, { prepare: false });

  try {
    const rows = await db<{ table_name: string; rls_enabled: boolean }[]>`
      select c.relname as table_name, c.relrowsecurity as rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relname = any(${expectedTables})
      order by c.relname
    `;

    const found = new Set(rows.map((row) => row.table_name));
    const missing = expectedTables.filter((table) => !found.has(table));

    if (missing.length > 0) {
      throw new Error(`Missing tables: ${missing.join(", ")}`);
    }

    const withoutRls = rows
      .filter((row) => !row.rls_enabled)
      .map((row) => row.table_name);

    if (withoutRls.length > 0) {
      throw new Error(`Tables without RLS: ${withoutRls.join(", ")}`);
    }

    const [categoryCount] = await db<{ count: string }[]>`
      select count(*)::text as count from categories
    `;
    const [productCount] = await db<{ count: string }[]>`
      select count(*)::text as count from products
    `;
    const [attributeCount] = await db<{ count: string }[]>`
      select count(*)::text as count from attributes
    `;

    console.log("Database verification passed.");
    console.log(`Tables: ${rows.length}/${expectedTables.length}`);
    console.log(`Categories: ${categoryCount.count}`);
    console.log(`Products: ${productCount.count}`);
    console.log(`Attributes: ${attributeCount.count}`);
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
