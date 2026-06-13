import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  ne,
  type SQL,
} from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/db";
import {
  attributeOptions,
  attributes,
  categories,
  productAttributeValues,
  productImages,
  products,
  type AttributeType,
  type ProfileRole,
} from "@/db/schema";
import type { ProductCardSource } from "@/lib/data/product-presenter";
import {
  sampleAttributeOptions,
  sampleAttributes,
  sampleCategories,
  sampleProductAttributeValues,
  sampleProducts,
} from "./sample-data";

type ViewerRole = ProfileRole | "PUBLIC";
type SortKey = "featured" | "name_asc" | "name_desc" | "brand_asc";

export type CatalogQuery = {
  role: ViewerRole;
  search?: string;
  category?: string;
  brand?: string;
  model?: string;
  attributes?: Record<string, string | string[] | undefined>;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

export type CatalogFilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type CatalogAttributeFilter = {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  values: CatalogFilterOption[];
};

export type CatalogFilters = {
  categories: CatalogFilterOption[];
  brands: CatalogFilterOption[];
  models: CatalogFilterOption[];
  attributes: CatalogAttributeFilter[];
};

export type CatalogAttributeValue = {
  attributeId: string;
  attributeName: string;
  attributeSlug: string;
  type: AttributeType;
  unit: string | null;
  value: string;
};

export type AdminAttributeWithOptions = {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  isFilterable: boolean;
  isVisible: boolean;
  sortOrder: number;
  options: Array<{
    id: string;
    value: string;
    sortOrder: number;
  }>;
};

type InternalCatalogProduct = ProductCardSource & {
  oemCode: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  shortDescription: string | null;
  description?: string | null;
  isFeatured?: boolean;
  attributes: CatalogAttributeValue[];
};

type PublicProduct = Omit<InternalCatalogProduct, "price">;
type PrivateProduct = InternalCatalogProduct & { price: string };

export type ProductDetail = (PublicProduct | PrivateProduct) & {
  description: string | null;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
  relatedProducts: ProductCardSource[];
};

export async function getCatalogProducts(query: CatalogQuery) {
  const page = Math.max(query.page ?? 1, 1);
  const pageSize = Math.min(Math.max(query.pageSize ?? 12, 1), 48);
  const allProducts = hasDatabaseUrl()
    ? await getDbCatalogProducts(query)
    : getSampleCatalogProducts(query.role);
  const filtered = applyCatalogFilters(allProducts, query);
  const sorted = sortProducts(filtered, query.sort ?? "featured");
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize).map((product) =>
    stripPriceForRole(product, query.role),
  );

  return {
    products: paginated,
    total: sorted.length,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(sorted.length / pageSize), 1),
  };
}

export async function getCatalogFilters(): Promise<CatalogFilters> {
  const products = hasDatabaseUrl()
    ? await getDbCatalogProducts({ role: "ADMIN" })
    : getSampleCatalogProducts("ADMIN");

  const activeCategories = hasDatabaseUrl() ? await getCategories() : sampleCategories;
  const filterableAttributes = hasDatabaseUrl()
    ? await getAttributes()
    : sampleAttributes;

  return {
    categories: activeCategories.map((category) => ({
      value: category.slug,
      label: category.name,
    })),
    brands: uniqueOptions(
      products.map((product) => product.brand).filter(Boolean) as string[],
    ),
    models: uniqueOptions(
      products.map((product) => product.model).filter(Boolean) as string[],
    ),
    attributes: filterableAttributes
      .filter((attribute) => attribute.isFilterable)
      .map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        unit: attribute.unit,
        values: uniqueOptions(
          products
            .flatMap((product) => product.attributes)
            .filter((value) => value.attributeSlug === attribute.slug)
            .map((value) => value.value),
        ),
      })),
  };
}

export async function getProductDetail(
  slug: string,
  role: ViewerRole,
): Promise<ProductDetail | null> {
  const detail = hasDatabaseUrl()
    ? await getDbProductDetail(slug, role)
    : getSampleProductDetail(slug);

  if (!detail) {
    return null;
  }

  return stripProductDetailPriceForRole(detail, role);
}

export async function getCategories() {
  if (!hasDatabaseUrl()) {
    return sampleCategories;
  }

  return getDb()
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
      imagePublicId: categories.imagePublicId,
      sortOrder: categories.sortOrder,
      isFeatured: categories.isFeatured,
      isActive: categories.isActive,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getAttributes() {
  if (!hasDatabaseUrl()) {
    return sampleAttributes;
  }

  return getDb()
    .select({
      id: attributes.id,
      name: attributes.name,
      slug: attributes.slug,
      type: attributes.type,
      unit: attributes.unit,
      isFilterable: attributes.isFilterable,
      isVisible: attributes.isVisible,
      sortOrder: attributes.sortOrder,
    })
    .from(attributes)
    .orderBy(asc(attributes.sortOrder), asc(attributes.name));
}

export async function getAttributesWithOptions(): Promise<AdminAttributeWithOptions[]> {
  if (!hasDatabaseUrl()) {
    return sampleAttributes.map((attribute) => ({
      ...attribute,
      options: sampleAttributeOptions
        .filter((option) => option.attributeId === attribute.id)
        .map(({ id, value, sortOrder }) => ({ id, value, sortOrder })),
    }));
  }

  const [attributeRows, optionRows] = await Promise.all([
    getAttributes(),
    getDb()
      .select({
        id: attributeOptions.id,
        attributeId: attributeOptions.attributeId,
        value: attributeOptions.value,
        sortOrder: attributeOptions.sortOrder,
      })
      .from(attributeOptions)
      .orderBy(asc(attributeOptions.sortOrder), asc(attributeOptions.value)),
  ]);

  return attributeRows.map((attribute) => ({
    ...attribute,
    options: optionRows
      .filter((option) => option.attributeId === attribute.id)
      .map(({ id, value, sortOrder }) => ({ id, value, sortOrder })),
  }));
}

export async function getPublicProducts(query?: string) {
  const result = await getCatalogProducts({ role: "PUBLIC", search: query });
  return result.products;
}

export async function getPrivateProducts(query?: string) {
  const result = await getCatalogProducts({ role: "BUYER", search: query });
  return result.products as PrivateProduct[];
}

export async function getAdminMetrics() {
  if (!hasDatabaseUrl()) {
    return {
      products: sampleProducts.length,
      categories: sampleCategories.length,
      attributes: sampleAttributes.length,
      pendingRequests: 0,
    };
  }

  const [productCount] = await getDb().select({ value: count() }).from(products);
  const [categoryCount] = await getDb().select({ value: count() }).from(categories);
  const [attributeCount] = await getDb().select({ value: count() }).from(attributes);

  return {
    products: productCount?.value ?? 0,
    categories: categoryCount?.value ?? 0,
    attributes: attributeCount?.value ?? 0,
    pendingRequests: 0,
  };
}

async function getDbCatalogProducts(query: Pick<CatalogQuery, "role">) {
  const db = getDb();
  const rows =
    query.role === "PUBLIC"
      ? await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            shortDescription: products.shortDescription,
            description: products.description,
            internalCode: products.internalCode,
            oemCode: products.oemCode,
            brand: products.brand,
            model: products.model,
            stockMode: products.stockMode,
            isFeatured: products.isFeatured,
            categoryName: categories.name,
            categorySlug: categories.slug,
            imageUrl: productImages.url,
          })
          .from(products)
          .leftJoin(categories, eq(categories.id, products.mainCategoryId))
          .leftJoin(productImages, eq(productImages.productId, products.id))
          .where(eq(products.isActive, true))
          .orderBy(desc(products.isFeatured), asc(products.name))
      : await db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            shortDescription: products.shortDescription,
            description: products.description,
            internalCode: products.internalCode,
            oemCode: products.oemCode,
            brand: products.brand,
            model: products.model,
            price: products.price,
            stockMode: products.stockMode,
            isFeatured: products.isFeatured,
            categoryName: categories.name,
            categorySlug: categories.slug,
            imageUrl: productImages.url,
          })
          .from(products)
          .leftJoin(categories, eq(categories.id, products.mainCategoryId))
          .leftJoin(productImages, eq(productImages.productId, products.id))
          .where(eq(products.isActive, true))
          .orderBy(desc(products.isFeatured), asc(products.name));

  const productMap = new Map<string, InternalCatalogProduct>();
  for (const row of rows) {
    if (!productMap.has(row.id)) {
      productMap.set(row.id, {
        ...row,
        price: getRowPrice(row),
        imageUrl: row.imageUrl,
        attributes: [],
      });
    }
  }

  await attachDbAttributes([...productMap.values()]);

  return [...productMap.values()];
}

async function attachDbAttributes(productList: InternalCatalogProduct[]) {
  if (productList.length === 0) {
    return;
  }

  const ids = productList.map((product) => product.id);
  const rows = await getDb()
    .select({
      productId: productAttributeValues.productId,
      attributeId: attributes.id,
      attributeName: attributes.name,
      attributeSlug: attributes.slug,
      type: attributes.type,
      unit: attributes.unit,
      valueText: productAttributeValues.valueText,
      valueNumber: productAttributeValues.valueNumber,
      valueBoolean: productAttributeValues.valueBoolean,
      optionValue: attributeOptions.value,
    })
    .from(productAttributeValues)
    .innerJoin(attributes, eq(attributes.id, productAttributeValues.attributeId))
    .leftJoin(attributeOptions, eq(attributeOptions.id, productAttributeValues.optionId))
    .where(inArray(productAttributeValues.productId, ids));

  const byProduct = new Map(productList.map((product) => [product.id, product]));
  for (const row of rows) {
    const product = byProduct.get(row.productId);
    const value =
      row.optionValue ??
      row.valueText ??
      row.valueNumber ??
      (row.valueBoolean === null || row.valueBoolean === undefined
        ? null
        : String(row.valueBoolean));

    if (!product || value === null) {
      continue;
    }

    product.attributes.push({
      attributeId: row.attributeId,
      attributeName: row.attributeName,
      attributeSlug: row.attributeSlug,
      type: row.type,
      unit: row.unit,
      value,
    });
  }
}

async function getDbProductDetail(
  slug: string,
  role: ViewerRole,
): Promise<ProductDetail | null> {
  const row =
    role === "PUBLIC"
      ? (
          await getDb()
            .select({
              id: products.id,
              name: products.name,
              slug: products.slug,
              shortDescription: products.shortDescription,
              description: products.description,
              internalCode: products.internalCode,
              oemCode: products.oemCode,
              brand: products.brand,
              model: products.model,
              stockMode: products.stockMode,
              isFeatured: products.isFeatured,
              categoryName: categories.name,
              categorySlug: categories.slug,
              imageUrl: productImages.url,
            })
            .from(products)
            .leftJoin(categories, eq(categories.id, products.mainCategoryId))
            .leftJoin(productImages, eq(productImages.productId, products.id))
            .where(and(eq(products.slug, slug), eq(products.isActive, true)))
        )[0]
      : (
          await getDb()
            .select({
              id: products.id,
              name: products.name,
              slug: products.slug,
              shortDescription: products.shortDescription,
              description: products.description,
              internalCode: products.internalCode,
              oemCode: products.oemCode,
              brand: products.brand,
              model: products.model,
              price: products.price,
              stockMode: products.stockMode,
              isFeatured: products.isFeatured,
              categoryName: categories.name,
              categorySlug: categories.slug,
              imageUrl: productImages.url,
            })
            .from(products)
            .leftJoin(categories, eq(categories.id, products.mainCategoryId))
            .leftJoin(productImages, eq(productImages.productId, products.id))
            .where(and(eq(products.slug, slug), eq(products.isActive, true)))
        )[0];

  if (!row) {
    return null;
  }

  const images = await getDb()
    .select({
      id: productImages.id,
      url: productImages.url,
      altText: productImages.altText,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(asc(productImages.sortOrder));

  const product: ProductDetail = {
    ...row,
    price: getRowPrice(row),
    imageUrl: row.imageUrl,
    attributes: [],
    description: row.description,
    images,
    relatedProducts: [],
  };

  await attachDbAttributes([product]);
  product.relatedProducts = await getDbRelatedProducts(
    row.id,
    row.categorySlug,
    role,
  );

  return product;
}

async function getDbRelatedProducts(
  productId: string,
  categorySlug: string | null,
  role: ViewerRole,
) {
  const filters: SQL[] = [eq(products.isActive, true), ne(products.id, productId)];

  if (categorySlug) {
    filters.push(eq(categories.slug, categorySlug));
  }

  const rows =
    role === "PUBLIC"
      ? await getDb()
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            shortDescription: products.shortDescription,
            internalCode: products.internalCode,
            oemCode: products.oemCode,
            brand: products.brand,
            model: products.model,
            stockMode: products.stockMode,
            categoryName: categories.name,
            categorySlug: categories.slug,
            imageUrl: productImages.url,
          })
          .from(products)
          .leftJoin(categories, eq(categories.id, products.mainCategoryId))
          .leftJoin(productImages, eq(productImages.productId, products.id))
          .where(and(...filters))
          .limit(3)
      : await getDb()
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            shortDescription: products.shortDescription,
            internalCode: products.internalCode,
            oemCode: products.oemCode,
            brand: products.brand,
            model: products.model,
            price: products.price,
            stockMode: products.stockMode,
            categoryName: categories.name,
            categorySlug: categories.slug,
            imageUrl: productImages.url,
          })
          .from(products)
          .leftJoin(categories, eq(categories.id, products.mainCategoryId))
          .leftJoin(productImages, eq(productImages.productId, products.id))
          .where(and(...filters))
          .limit(3);

  return rows;
}

function getSampleCatalogProducts(role: ViewerRole) {
  return sampleProducts.map((product) =>
    stripPriceForRole(
      {
        ...product,
        attributes: getSampleProductAttributes(product.id),
      },
      role,
    ),
  ) as InternalCatalogProduct[];
}

function getSampleProductDetail(slug: string): ProductDetail | null {
  const product = sampleProducts.find((item) => item.slug === slug);

  if (!product) {
    return null;
  }

  const relatedProducts = sampleProducts
    .filter(
      (item) =>
        item.mainCategoryId === product.mainCategoryId && item.id !== product.id,
    )
    .slice(0, 3);

  return {
    ...product,
    attributes: getSampleProductAttributes(product.id),
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
    relatedProducts,
  };
}

function getSampleProductAttributes(productId: string): CatalogAttributeValue[] {
  return sampleProductAttributeValues
    .filter((value) => value.productId === productId)
    .map((value) => {
      const attribute = sampleAttributes.find((item) => item.id === value.attributeId);
      const option = sampleAttributeOptions.find((item) => item.id === value.optionId);
      const renderedValue =
        option?.value ??
        value.valueText ??
        value.valueNumber ??
        (value.valueBoolean === null || value.valueBoolean === undefined
          ? ""
          : String(value.valueBoolean));

      if (!attribute || !renderedValue) {
        return null;
      }

      return {
        attributeId: attribute.id,
        attributeName: attribute.name,
        attributeSlug: attribute.slug,
        type: attribute.type,
        unit: attribute.unit,
        value: renderedValue,
      };
    })
    .filter(Boolean) as CatalogAttributeValue[];
}

function applyCatalogFilters<T extends InternalCatalogProduct>(
  productsList: T[],
  query: CatalogQuery,
) {
  const search = normalize(query.search);
  const category = normalize(query.category);
  const brand = normalize(query.brand);
  const model = normalize(query.model);
  const attributeFilters = Object.entries(query.attributes ?? {}).filter(
    ([, value]) =>
      value !== undefined &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0),
  );

  return productsList.filter((product) => {
    if (
      search &&
      ![
        product.name,
        product.brand,
        product.model,
        product.internalCode,
        product.oemCode,
      ]
        .filter(Boolean)
        .some((value) => normalize(value).includes(search))
    ) {
      return false;
    }

    if (category && normalize(product.categorySlug) !== category) {
      return false;
    }

    if (brand && normalize(product.brand) !== brand) {
      return false;
    }

    if (model && normalize(product.model) !== model) {
      return false;
    }

    return attributeFilters.every(([slug, expected]) => {
      const expectedValues = Array.isArray(expected) ? expected : [expected];
      const normalizedExpected = expectedValues.map(normalize);
      return product.attributes.some(
        (attribute) =>
          attribute.attributeSlug === slug &&
          normalizedExpected.includes(normalize(attribute.value)),
      );
    });
  });
}

function sortProducts<T extends InternalCatalogProduct>(productsList: T[], sort: SortKey) {
  return [...productsList].sort((a, b) => {
    if (sort === "name_desc") {
      return b.name.localeCompare(a.name);
    }

    if (sort === "brand_asc") {
      return (a.brand ?? "").localeCompare(b.brand ?? "") || a.name.localeCompare(b.name);
    }

    if (sort === "name_asc") {
      return a.name.localeCompare(b.name);
    }

    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || a.name.localeCompare(b.name);
  });
}

function stripPriceForRole<T extends InternalCatalogProduct | ProductDetail>(
  product: T,
  role: ViewerRole,
) {
  if (role === "ADMIN" || role === "BUYER") {
    return {
      ...product,
      price: getRowPrice(product) ?? "0.00",
    };
  }

  const publicProduct = { ...product } as T & { price?: string };
  delete publicProduct.price;
  return publicProduct;
}

function getRowPrice(row: object) {
  return "price" in row && typeof row.price === "string" ? row.price : undefined;
}

function stripProductDetailPriceForRole(
  detail: ProductDetail,
  role: ViewerRole,
): ProductDetail {
  return stripPriceForRole(
    {
      ...detail,
      relatedProducts: detail.relatedProducts.map((product) =>
        stripPriceForRole(product as InternalCatalogProduct, role),
      ),
    },
    role,
  ) as ProductDetail;
}

function uniqueOptions(values: string[]) {
  return [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}
