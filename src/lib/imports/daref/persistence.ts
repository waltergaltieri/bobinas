import { eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  attributeOptions,
  attributes,
  categories,
  productAttributeValues,
  productCategories,
  productImages,
  productImportMetadata,
  products,
} from "@/db/schema";

import type { DarefImportPersistence } from "./importer";
import type { DarefImportPlan, PlannedProduct } from "./types";

export function createDarefImportPersistence(): DarefImportPersistence {
  const db = getDb();

  return {
    async inspect(plan) {
      const codes = plan.products.map((product) => product.internalCode);
      const slugs = plan.products.map((product) => product.slug);
      const attributeSlugs = plan.attributes.map((attribute) => attribute.slug);

      const [existingRows, slugRows, attributeRows] = await Promise.all([
        db
          .select({
            id: products.id,
            internalCode: products.internalCode,
            reviewStatus: products.reviewStatus,
            source: productImportMetadata.source,
          })
          .from(products)
          .leftJoin(
            productImportMetadata,
            eq(productImportMetadata.productId, products.id),
          )
          .where(inArray(products.internalCode, codes)),
        db
          .select({ internalCode: products.internalCode, slug: products.slug })
          .from(products)
          .where(inArray(products.slug, slugs)),
        db
          .select({ slug: attributes.slug, type: attributes.type })
          .from(attributes)
          .where(inArray(attributes.slug, attributeSlugs)),
      ]);

      const plannedCodeBySlug = new Map(
        plan.products.map((product) => [product.slug, product.internalCode]),
      );
      const slugConflicts = slugRows.filter(
        (row) => plannedCodeBySlug.get(row.slug) !== row.internalCode,
      );
      if (slugConflicts.length > 0) {
        throw new Error(
          `Conflictos de slug: ${slugConflicts
            .map((row) => `${row.slug} (${row.internalCode})`)
            .join(", ")}`,
        );
      }

      const plannedAttributes = new Map(
        plan.attributes.map((attribute) => [attribute.slug, attribute]),
      );
      const attributeTypeConflicts = attributeRows.flatMap((row) => {
        const planned = plannedAttributes.get(row.slug);
        return planned && planned.type !== row.type
          ? [`${row.slug}: ${row.type} != ${planned.type}`]
          : [];
      });

      return {
        existingProducts: existingRows,
        attributeTypeConflicts,
      };
    },

    async backup(codes) {
      if (codes.length === 0) return emptyBackup();

      const productRows = await db
        .select()
        .from(products)
        .where(inArray(products.internalCode, codes));
      const productIds = productRows.map((product) => product.id);
      if (productIds.length === 0) return emptyBackup();

      const [imageRows, valueRows, metadataRows, categoryRows] = await Promise.all([
        db
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds)),
        db
          .select()
          .from(productAttributeValues)
          .where(inArray(productAttributeValues.productId, productIds)),
        db
          .select()
          .from(productImportMetadata)
          .where(inArray(productImportMetadata.productId, productIds)),
        db
          .select()
          .from(productCategories)
          .where(inArray(productCategories.productId, productIds)),
      ]);

      return {
        generatedAt: new Date().toISOString(),
        products: productRows,
        images: imageRows,
        attributeValues: valueRows,
        importMetadata: metadataRows,
        secondaryCategories: categoryRows,
      };
    },

    async apply({ plan, products: plannedProducts, images }) {
      if (plannedProducts.length === 0) return;

      await db.transaction(async (tx) => {
        const now = new Date();
        const targetCodes = plannedProducts.map((product) => product.internalCode);
        const currentRows = await tx
          .select({
            internalCode: products.internalCode,
            reviewStatus: products.reviewStatus,
            source: productImportMetadata.source,
          })
          .from(products)
          .leftJoin(
            productImportMetadata,
            eq(productImportMetadata.productId, products.id),
          )
          .where(inArray(products.internalCode, targetCodes));

        const unsafe = currentRows.filter(
          (row) =>
            row.source !== plannedProducts[0].source.name ||
            row.reviewStatus !== "PENDING",
        );
        if (unsafe.length > 0) {
          throw new Error(
            `La revision cambio durante la carga: ${unsafe
              .map((row) => row.internalCode)
              .join(", ")}`,
          );
        }

        await upsertCategories(tx, plan, now);
        await upsertAttributes(tx, plan, now);

        const categoryRows = await tx
          .select({ id: categories.id, slug: categories.slug })
          .from(categories)
          .where(inArray(categories.slug, plan.categories.map((item) => item.slug)));
        const categoryBySlug = new Map(
          categoryRows.map((category) => [category.slug, category.id]),
        );
        const attributeRows = await tx
          .select({ id: attributes.id, slug: attributes.slug })
          .from(attributes)
          .where(inArray(attributes.slug, plan.attributes.map((item) => item.slug)));
        const attributeBySlug = new Map(
          attributeRows.map((attribute) => [attribute.slug, attribute.id]),
        );

        await upsertAttributeOptions(tx, plan, attributeBySlug);
        const multiselectAttributeIds = plan.attributes
          .filter((attribute) => attribute.type === "MULTISELECT")
          .map((attribute) => requireMapped(attributeBySlug, attribute.slug));
        const optionRows = await tx
          .select({
            id: attributeOptions.id,
            attributeId: attributeOptions.attributeId,
            value: attributeOptions.value,
          })
          .from(attributeOptions)
          .where(inArray(attributeOptions.attributeId, multiselectAttributeIds));
        const optionByKey = new Map(
          optionRows.map((option) => [
            optionKey(option.attributeId, option.value),
            option.id,
          ]),
        );

        const upsertedProducts = await tx
          .insert(products)
          .values(
            plannedProducts.map((product) => ({
              name: product.name,
              slug: product.slug,
              shortDescription: product.shortDescription,
              description: product.description,
              brand: product.brand,
              model: product.model,
              internalCode: product.internalCode,
              oemCode: product.oemCode,
              mainCategoryId: requireMapped(
                categoryBySlug,
                product.mainCategorySlug,
              ),
              price: product.price,
              stockMode: product.stockMode,
              stockQuantity: product.stockQuantity,
              isActive: product.isActive,
              isFeatured: product.isFeatured,
              reviewStatus: product.reviewStatus,
              reviewNotes: product.reviewNotes,
              reviewedAt: null,
            })),
          )
          .onConflictDoUpdate({
            target: products.internalCode,
            set: {
              name: sql`excluded.name`,
              slug: sql`excluded.slug`,
              shortDescription: sql`excluded.short_description`,
              description: sql`excluded.description`,
              brand: sql`excluded.brand`,
              model: sql`excluded.model`,
              oemCode: sql`excluded.oem_code`,
              mainCategoryId: sql`excluded.main_category_id`,
              price: "0.00",
              stockMode: "ON_REQUEST",
              stockQuantity: 0,
              isActive: false,
              isFeatured: false,
              reviewStatus: "PENDING",
              reviewNotes: sql`excluded.review_notes`,
              reviewedAt: null,
              updatedAt: now,
            },
          })
          .returning({ id: products.id, internalCode: products.internalCode });
        const productByCode = new Map(
          upsertedProducts.map((product) => [product.internalCode, product.id]),
        );
        const productIds = [...productByCode.values()];

        await tx
          .delete(productAttributeValues)
          .where(inArray(productAttributeValues.productId, productIds));

        const values = buildAttributeValueRows(
          plannedProducts,
          productByCode,
          attributeBySlug,
          optionByKey,
        );
        if (values.length > 0) {
          await tx.insert(productAttributeValues).values(values);
        }

        const imageCodes = [...images.keys()];
        if (imageCodes.length > 0) {
          const imageProductIds = imageCodes.map((code) =>
            requireMapped(productByCode, code),
          );
          await tx
            .delete(productImages)
            .where(inArray(productImages.productId, imageProductIds));
          await tx.insert(productImages).values(
            imageCodes.map((code) => {
              const image = images.get(code)!;
              const product = plannedProducts.find(
                (candidate) => candidate.internalCode === code,
              )!;
              return {
                productId: requireMapped(productByCode, code),
                url: image.url,
                publicId: image.publicId,
                altText: product.image.altText,
                sortOrder: 0,
              };
            }),
          );
        }

        await tx
          .insert(productImportMetadata)
          .values(
            plannedProducts.map((product) => ({
              productId: requireMapped(productByCode, product.internalCode),
              source: product.source.name,
              sourceUrl: product.source.url,
              sourceExternalId: product.source.externalId,
              sourceModifiedAt: product.source.modifiedAt
                ? new Date(product.source.modifiedAt)
                : null,
              importBatch: product.source.importBatch,
              originalImageUrl: product.image.sourceUrl,
              requiresReview: product.source.requiresReview,
            })),
          )
          .onConflictDoUpdate({
            target: productImportMetadata.productId,
            set: {
              source: sql`excluded.source`,
              sourceUrl: sql`excluded.source_url`,
              sourceExternalId: sql`excluded.source_external_id`,
              sourceModifiedAt: sql`excluded.source_modified_at`,
              importBatch: sql`excluded.import_batch`,
              originalImageUrl: sql`excluded.original_image_url`,
              requiresReview: sql`excluded.requires_review`,
              updatedAt: now,
            },
          });
      });
    },
  };
}

type DarefTransaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

async function upsertCategories(
  tx: DarefTransaction,
  plan: DarefImportPlan,
  now: Date,
) {
  await tx
    .insert(categories)
    .values(
      plan.categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        isFeatured: false,
        isActive: true,
      })),
    )
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        sortOrder: sql`excluded.sort_order`,
        isActive: true,
        updatedAt: now,
      },
    });
}

async function upsertAttributes(
  tx: DarefTransaction,
  plan: DarefImportPlan,
  now: Date,
) {
  await tx
    .insert(attributes)
    .values(plan.attributes)
    .onConflictDoUpdate({
      target: attributes.slug,
      set: {
        name: sql`excluded.name`,
        unit: sql`excluded.unit`,
        isFilterable: sql`excluded.is_filterable`,
        isVisible: sql`excluded.is_visible`,
        sortOrder: sql`excluded.sort_order`,
        updatedAt: now,
      },
    });
}

async function upsertAttributeOptions(
  tx: DarefTransaction,
  plan: DarefImportPlan,
  attributeBySlug: Map<string, string>,
) {
  if (plan.options.length === 0) return;
  await tx
    .insert(attributeOptions)
    .values(
      plan.options.map((option) => ({
        attributeId: requireMapped(attributeBySlug, option.attributeSlug),
        value: option.value,
        sortOrder: option.sortOrder,
      })),
    )
    .onConflictDoNothing();
}

function buildAttributeValueRows(
  plannedProducts: PlannedProduct[],
  productByCode: Map<string, string>,
  attributeBySlug: Map<string, string>,
  optionByKey: Map<string, string>,
) {
  return plannedProducts.flatMap((product) =>
    product.attributeValues.map((value) => {
      const attributeId = requireMapped(attributeBySlug, value.attributeSlug);
      return {
        productId: requireMapped(productByCode, product.internalCode),
        attributeId,
        valueText: value.kind === "text" ? value.value : null,
        valueNumber: value.kind === "number" ? value.value : null,
        valueBoolean: null,
        optionId:
          value.kind === "option"
            ? requireMapped(optionByKey, optionKey(attributeId, value.value))
            : null,
      };
    }),
  );
}

function optionKey(attributeId: string, value: string) {
  return `${attributeId}\u0000${value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()}`;
}

function requireMapped(map: Map<string, string>, key: string) {
  const value = map.get(key);
  if (!value) throw new Error(`No se pudo resolver la referencia: ${key}`);
  return value;
}

function emptyBackup() {
  return {
    generatedAt: new Date().toISOString(),
    products: [],
    images: [],
    attributeValues: [],
    importMetadata: [],
    secondaryCategories: [],
  };
}
