import "dotenv/config";

import postgres from "postgres";

import { readServerEnv } from "@/lib/env";

const expectedTables = [
  "profiles",
  "categories",
  "products",
  "product_categories",
  "product_images",
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
    const rows = await db<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      and table_name = any(${expectedTables})
      order by table_name
    `;

    const found = new Set(rows.map((row) => row.table_name));
    const missing = expectedTables.filter((table) => !found.has(table));

    if (missing.length > 0) {
      throw new Error(`Missing tables: ${missing.join(", ")}`);
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
