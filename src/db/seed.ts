import "@/scripts/load-env";

import { sql } from "drizzle-orm";

import { closeDb, getDb } from "@/db";
import {
  attributeOptions,
  attributes,
  categories,
  popupSettings,
  siteSettings,
} from "@/db/schema";
import {
  sampleAttributeOptions,
  sampleAttributes,
  sampleCategories,
  samplePopupSettings,
} from "@/lib/data/sample-data";

async function main() {
  const db = getDb();

  await db
    .insert(categories)
    .values(
      sampleCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        imagePublicId: category.imagePublicId,
        sortOrder: category.sortOrder,
        isFeatured: category.isFeatured,
        isActive: category.isActive,
      })),
    )
    .onConflictDoUpdate({
      target: categories.id,
      set: {
        name: sql`excluded.name`,
        slug: sql`excluded.slug`,
        description: sql`excluded.description`,
        imageUrl: sql`excluded.image_url`,
        imagePublicId: sql`excluded.image_public_id`,
        sortOrder: sql`excluded.sort_order`,
        isFeatured: sql`excluded.is_featured`,
        isActive: sql`excluded.is_active`,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(attributes)
    .values(
      sampleAttributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        unit: attribute.unit,
        isFilterable: attribute.isFilterable,
        isVisible: attribute.isVisible,
        sortOrder: attribute.sortOrder,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(attributeOptions)
    .values(
      sampleAttributeOptions.map((option) => ({
        id: option.id,
        attributeId: option.attributeId,
        value: option.value,
        sortOrder: option.sortOrder,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(siteSettings)
    .values({
      id: "12121212-1212-4121-8121-121212121212",
      businessName: "Bobinas",
      isActive: true,
    })
    .onConflictDoNothing();

  await db
    .insert(popupSettings)
    .values({
      id: samplePopupSettings.id,
      isActive: false,
      imageUrl: null,
      imagePublicId: null,
      title: null,
      text: null,
      buttonText: null,
      buttonLink: null,
      showOnce: samplePopupSettings.showOnce,
      startsAt: null,
      endsAt: null,
    })
    .onConflictDoNothing();

  console.log("Base seed data inserted.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
