import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import type {
  DarefImportPersistence,
  UploadedDarefImage,
} from "./importer";
import type { PlannedProduct } from "./types";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
type SupabaseError = { message: string; code?: string } | null;

type ProductLookupRow = {
  id: string;
  internal_code: string;
  slug?: string;
  review_status: "PENDING" | "APPROVED" | "REJECTED";
};

type MetadataLookupRow = {
  product_id: string;
  source: string;
};

type AttributeLookupRow = {
  id: string;
  slug: string;
  type: string;
};

type IdSlugRow = { id: string; slug: string };
type OptionLookupRow = { id: string; attribute_id: string; value: string };

const READ_CHUNK_SIZE = 100;
const WRITE_CHUNK_SIZE = 100;

export function createDarefSupabasePersistence(
  client: SupabaseAdminClient = createSupabaseAdminClient(),
): DarefImportPersistence {
  return {
    async inspect(plan) {
      const productRows = await selectProductsByCodes(
        client,
        plan.products.map((product) => product.internalCode),
        "id,internal_code,review_status",
      );
      const slugRows = await selectProductsBySlugs(
        client,
        plan.products.map((product) => product.slug),
      );
      const metadataRows = await selectMetadataByProductIds(
        client,
        productRows.map((row) => row.id),
      );
      const attributeRows = await selectAttributesBySlugs(
        client,
        plan.attributes.map((attribute) => attribute.slug),
      );

      const plannedCodeBySlug = new Map(
        plan.products.map((product) => [product.slug, product.internalCode]),
      );
      const slugConflicts = slugRows.filter(
        (row) => plannedCodeBySlug.get(row.slug ?? "") !== row.internal_code,
      );
      if (slugConflicts.length > 0) {
        throw new Error(
          `Conflictos de slug: ${slugConflicts
            .map((row) => `${row.slug} (${row.internal_code})`)
            .join(", ")}`,
        );
      }

      const sourceByProduct = new Map(
        metadataRows.map((row) => [row.product_id, row.source]),
      );
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
        existingProducts: productRows.map((row) => ({
          id: row.id,
          internalCode: row.internal_code,
          reviewStatus: row.review_status,
          source: sourceByProduct.get(row.id) ?? null,
        })),
        attributeTypeConflicts,
      };
    },

    async backup(codes) {
      if (codes.length === 0) return emptyBackup();

      const productRows = await selectTableInChunks<Record<string, unknown>>(
        codes,
        async (chunk) => {
          const result = await client
            .from("products")
            .select("*")
            .in("internal_code", chunk);
          assertSuccess(result.error, "leer productos para respaldo");
          return (result.data ?? []) as unknown as Record<string, unknown>[];
        },
      );
      const productIds = productRows.map((row) => String(row.id));
      if (productIds.length === 0) return emptyBackup();

      const [images, attributeValues, importMetadata, secondaryCategories] =
        await Promise.all([
          backupTable(client, "product_images", productIds),
          backupTable(client, "product_attribute_values", productIds),
          backupTable(client, "product_import_metadata", productIds),
          backupTable(client, "product_categories", productIds),
        ]);

      return {
        generatedAt: new Date().toISOString(),
        products: productRows,
        images,
        attributeValues,
        importMetadata,
        secondaryCategories,
      };
    },

    async apply({ plan, products, images }) {
      if (products.length === 0) return;

      // The service API cannot wrap several PostgREST calls in one transaction.
      // Every write is idempotent and products are forced inactive/PENDING, so an
      // interrupted run remains private and can be safely resumed.
      await assertProductsStillSafe(client, products);
      const now = new Date().toISOString();

      await upsertInChunks(
        client,
        "categories",
        plan.categories.map((category) => ({
          name: category.name,
          slug: category.slug,
          description: category.description,
          sort_order: category.sortOrder,
          is_featured: false,
          is_active: true,
          updated_at: now,
        })),
        "slug",
      );
      await upsertInChunks(
        client,
        "attributes",
        plan.attributes.map((attribute) => ({
          name: attribute.name,
          slug: attribute.slug,
          type: attribute.type,
          unit: attribute.unit,
          is_filterable: attribute.isFilterable,
          is_visible: attribute.isVisible,
          sort_order: attribute.sortOrder,
          updated_at: now,
        })),
        "slug",
      );

      const categoryRows = await selectCategoriesBySlugs(
        client,
        plan.categories.map((category) => category.slug),
      );
      const attributeRows = await selectAttributesBySlugs(
        client,
        plan.attributes.map((attribute) => attribute.slug),
      );
      const categoryBySlug = new Map(
        categoryRows.map((category) => [category.slug, category.id]),
      );
      const attributeBySlug = new Map(
        attributeRows.map((attribute) => [attribute.slug, attribute.id]),
      );

      await upsertInChunks(
        client,
        "attribute_options",
        plan.options.map((option) => ({
          attribute_id: requireMapped(
            attributeBySlug,
            option.attributeSlug,
          ),
          value: option.value,
          sort_order: option.sortOrder,
        })),
        "attribute_id,value",
      );

      const multiselectAttributeIds = plan.attributes
        .filter((attribute) => attribute.type === "MULTISELECT")
        .map((attribute) => requireMapped(attributeBySlug, attribute.slug));
      const optionRows = await selectOptionsByAttributeIds(
        client,
        multiselectAttributeIds,
      );
      const optionByKey = new Map(
        optionRows.map((option) => [
          optionKey(option.attribute_id, option.value),
          option.id,
        ]),
      );

      await upsertInChunks(
        client,
        "products",
        buildSupabaseProductRows(products, categoryBySlug, now),
        "internal_code",
      );
      const upsertedProducts = await selectProductsByCodes(
        client,
        products.map((product) => product.internalCode),
        "id,internal_code,review_status",
      );
      const productByCode = new Map(
        upsertedProducts.map((product) => [product.internal_code, product.id]),
      );
      const productIds = [...productByCode.values()];

      await deleteByIds(client, "product_attribute_values", productIds);
      await insertInChunks(
        client,
        "product_attribute_values",
        buildSupabaseAttributeValueRows(
          products,
          productByCode,
          attributeBySlug,
          optionByKey,
        ),
      );

      await replaceImages(client, products, productByCode, images);
      await upsertInChunks(
        client,
        "product_import_metadata",
        products.map((product) => ({
          product_id: requireMapped(productByCode, product.internalCode),
          source: product.source.name,
          source_url: product.source.url,
          source_external_id: product.source.externalId,
          source_modified_at: product.source.modifiedAt,
          import_batch: product.source.importBatch,
          original_image_url: product.image.sourceUrl,
          requires_review: product.source.requiresReview,
          updated_at: now,
        })),
        "product_id",
      );
    },
  };
}

export function buildSupabaseProductRows(
  products: PlannedProduct[],
  categoryBySlug: Map<string, string>,
  updatedAt = new Date().toISOString(),
) {
  return products.map((product) => ({
    name: product.name,
    slug: product.slug,
    short_description: product.shortDescription,
    description: product.description,
    brand: product.brand,
    model: product.model,
    internal_code: product.internalCode,
    oem_code: product.oemCode,
    main_category_id: requireMapped(
      categoryBySlug,
      product.mainCategorySlug,
    ),
    price: "0.00",
    stock_mode: "ON_REQUEST",
    stock_quantity: 0,
    is_active: false,
    is_featured: false,
    review_status: "PENDING",
    review_notes: product.reviewNotes,
    reviewed_at: null,
    updated_at: updatedAt,
  }));
}

export function buildSupabaseAttributeValueRows(
  products: PlannedProduct[],
  productByCode: Map<string, string>,
  attributeBySlug: Map<string, string>,
  optionByKey: Map<string, string>,
) {
  return products.flatMap((product) =>
    product.attributeValues.map((value) => {
      const attributeId = requireMapped(
        attributeBySlug,
        value.attributeSlug,
      );
      return {
        product_id: requireMapped(productByCode, product.internalCode),
        attribute_id: attributeId,
        value_text: value.kind === "text" ? value.value : null,
        value_number: value.kind === "number" ? value.value : null,
        value_boolean: null,
        option_id:
          value.kind === "option"
            ? requireMapped(
                optionByKey,
                optionKey(attributeId, value.value),
              )
            : null,
      };
    }),
  );
}

export function chunkItems<T>(items: T[], size: number): T[][] {
  if (size < 1) throw new Error("El tamaño de lote debe ser positivo.");
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function assertProductsStillSafe(
  client: SupabaseAdminClient,
  products: PlannedProduct[],
) {
  const rows = await selectProductsByCodes(
    client,
    products.map((product) => product.internalCode),
    "id,internal_code,review_status",
  );
  const metadata = await selectMetadataByProductIds(
    client,
    rows.map((row) => row.id),
  );
  const sourceByProduct = new Map(
    metadata.map((row) => [row.product_id, row.source]),
  );
  const sourceName = products[0]?.source.name;
  const unsafe = rows.filter(
    (row) =>
      sourceByProduct.get(row.id) !== sourceName ||
      row.review_status !== "PENDING",
  );
  if (unsafe.length > 0) {
    throw new Error(
      `La revision cambio durante la carga: ${unsafe
        .map((row) => row.internal_code)
        .join(", ")}`,
    );
  }
}

async function replaceImages(
  client: SupabaseAdminClient,
  products: PlannedProduct[],
  productByCode: Map<string, string>,
  images: Map<string, UploadedDarefImage>,
) {
  const imageCodes = [...images.keys()];
  if (imageCodes.length === 0) return;
  const productIds = imageCodes.map((code) =>
    requireMapped(productByCode, code),
  );
  await deleteByIds(client, "product_images", productIds);
  const productByInternalCode = new Map(
    products.map((product) => [product.internalCode, product]),
  );
  await insertInChunks(
    client,
    "product_images",
    imageCodes.map((code) => {
      const image = images.get(code);
      const product = productByInternalCode.get(code);
      if (!image || !product) throw new Error(`Imagen sin producto: ${code}`);
      return {
        product_id: requireMapped(productByCode, code),
        url: image.url,
        public_id: image.publicId,
        alt_text: product.image.altText,
        sort_order: 0,
      };
    }),
  );
}

async function selectProductsByCodes(
  client: SupabaseAdminClient,
  codes: string[],
  columns: string,
) {
  return selectTableInChunks<ProductLookupRow>(codes, async (chunk) => {
    const result = await client
      .from("products")
      .select(columns)
      .in("internal_code", chunk);
    assertSuccess(result.error, "consultar productos");
    return (result.data ?? []) as unknown as ProductLookupRow[];
  });
}

async function selectProductsBySlugs(
  client: SupabaseAdminClient,
  slugs: string[],
) {
  return selectTableInChunks<ProductLookupRow>(slugs, async (chunk) => {
    const result = await client
      .from("products")
      .select("id,internal_code,slug,review_status")
      .in("slug", chunk);
    assertSuccess(result.error, "consultar slugs de productos");
    return (result.data ?? []) as unknown as ProductLookupRow[];
  });
}

async function selectMetadataByProductIds(
  client: SupabaseAdminClient,
  productIds: string[],
) {
  return selectTableInChunks<MetadataLookupRow>(productIds, async (chunk) => {
    const result = await client
      .from("product_import_metadata")
      .select("product_id,source")
      .in("product_id", chunk);
    assertSuccess(result.error, "consultar metadatos de importacion");
    return (result.data ?? []) as unknown as MetadataLookupRow[];
  });
}

async function selectAttributesBySlugs(
  client: SupabaseAdminClient,
  slugs: string[],
) {
  return selectTableInChunks<AttributeLookupRow>(slugs, async (chunk) => {
    const result = await client
      .from("attributes")
      .select("id,slug,type")
      .in("slug", chunk);
    assertSuccess(result.error, "consultar caracteristicas");
    return (result.data ?? []) as unknown as AttributeLookupRow[];
  });
}

async function selectCategoriesBySlugs(
  client: SupabaseAdminClient,
  slugs: string[],
) {
  return selectTableInChunks<IdSlugRow>(slugs, async (chunk) => {
    const result = await client
      .from("categories")
      .select("id,slug")
      .in("slug", chunk);
    assertSuccess(result.error, "consultar categorias");
    return (result.data ?? []) as unknown as IdSlugRow[];
  });
}

async function selectOptionsByAttributeIds(
  client: SupabaseAdminClient,
  attributeIds: string[],
) {
  return selectTableInChunks<OptionLookupRow>(
    attributeIds,
    async (chunk) => {
      const result = await client
        .from("attribute_options")
        .select("id,attribute_id,value")
        .in("attribute_id", chunk);
      assertSuccess(result.error, "consultar opciones de caracteristicas");
      return (result.data ?? []) as unknown as OptionLookupRow[];
    },
  );
}

async function backupTable(
  client: SupabaseAdminClient,
  table: string,
  productIds: string[],
) {
  return selectTableInChunks<Record<string, unknown>>(
    productIds,
    async (chunk) => {
      const result = await client
        .from(table)
        .select("*")
        .in("product_id", chunk);
      assertSuccess(result.error, `respaldar ${table}`);
      return (result.data ?? []) as unknown as Record<string, unknown>[];
    },
  );
}

async function deleteByIds(
  client: SupabaseAdminClient,
  table: string,
  productIds: string[],
) {
  for (const chunk of chunkItems(productIds, READ_CHUNK_SIZE)) {
    const result = await client.from(table).delete().in("product_id", chunk);
    assertSuccess(result.error, `limpiar ${table}`);
  }
}

async function upsertInChunks(
  client: SupabaseAdminClient,
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) {
  for (const chunk of chunkItems(rows, WRITE_CHUNK_SIZE)) {
    const result = await client
      .from(table)
      .upsert(chunk, { onConflict, ignoreDuplicates: false });
    assertSuccess(result.error, `actualizar ${table}`);
  }
}

async function insertInChunks(
  client: SupabaseAdminClient,
  table: string,
  rows: Record<string, unknown>[],
) {
  for (const chunk of chunkItems(rows, WRITE_CHUNK_SIZE)) {
    const result = await client.from(table).insert(chunk);
    assertSuccess(result.error, `insertar ${table}`);
  }
}

async function selectTableInChunks<T>(
  values: string[],
  fetchChunk: (chunk: string[]) => Promise<T[]>,
) {
  const rows: T[] = [];
  for (const chunk of chunkItems(values, READ_CHUNK_SIZE)) {
    rows.push(...(await fetchChunk(chunk)));
  }
  return rows;
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

function assertSuccess(error: SupabaseError, action: string) {
  if (error) {
    throw new Error(
      `${action}: ${error.code ? `${error.code} ` : ""}${error.message}`,
    );
  }
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
