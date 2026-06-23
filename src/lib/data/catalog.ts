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
  productCategories,
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

export type CatalogSearchSuggestion = {
  type:
    | "product"
    | "internal_code"
    | "oem_code"
    | "brand"
    | "model"
    | "category"
    | "attribute";
  label: string;
  value: string;
  helper: string;
  params: Record<string, string>;
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

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  brand?: string;
  stockMode?: string;
  status?: "active" | "inactive" | "all";
};

export type AdminProduct = PrivateProduct & {
  description: string | null;
  mainCategoryId: string | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  secondaryCategoryIds: string[];
  images: Array<{
    id: string;
    url: string;
    publicId: string;
    altText: string | null;
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
  let allProducts: InternalCatalogProduct[];

  if (hasDatabaseUrl()) {
    try {
      allProducts = await getDbCatalogProducts(query);
    } catch {
      allProducts = getSampleCatalogProducts(query.role);
    }
  } else {
    allProducts = getSampleCatalogProducts(query.role);
  }

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

export async function getCatalogSearchSuggestions(
  query: string,
  options: { includeAll?: boolean; limit?: number } = {},
): Promise<CatalogSearchSuggestion[]> {
  const normalizedQuery = normalizeForSearch(query);

  if (!options.includeAll && normalizedQuery.text.length < 2) {
    return [];
  }

  const [allProducts, filters] = await Promise.all([
    hasDatabaseUrl()
      ? getDbCatalogProducts({ role: "ADMIN" })
      : Promise.resolve(getSampleCatalogProducts("ADMIN")),
    getCatalogFilters(),
  ]);
  const sourceProducts = options.includeAll
    ? allProducts
    : applyCatalogFilters(allProducts, {
        role: "ADMIN",
        search: query,
      }).slice(0, 8);
  const suggestions: CatalogSearchSuggestion[] = [];

  for (const product of sourceProducts) {
    pushSuggestion(suggestions, normalizedQuery, {
      type: "product",
      label: product.name,
      value: product.name,
      helper: [product.internalCode, product.brand, product.model]
        .filter(Boolean)
        .join(" - "),
      params: { q: product.name },
    });
    pushSuggestion(suggestions, normalizedQuery, {
      type: "internal_code",
      label: product.internalCode,
      value: product.internalCode,
      helper: product.name,
      params: { q: product.internalCode },
    });
    if (product.oemCode) {
      pushSuggestion(suggestions, normalizedQuery, {
        type: "oem_code",
        label: product.oemCode,
        value: product.oemCode,
        helper: product.name,
        params: { q: product.oemCode },
      });
    }
  }

  for (const product of allProducts) {
    for (const attribute of product.attributes) {
      pushSuggestion(suggestions, normalizedQuery, {
        type: "attribute",
        label: attribute.value,
        value: attribute.value,
        helper: `${attribute.attributeName}${attribute.unit ? ` (${attribute.unit})` : ""}`,
        params: { [`attr_${attribute.attributeSlug}`]: attribute.value },
      });
    }
  }

  for (const brand of filters.brands) {
    pushSuggestion(suggestions, normalizedQuery, {
      type: "brand",
      label: brand.label,
      value: brand.value,
      helper: "Marca",
      params: { brand: brand.value },
    });
  }

  for (const model of filters.models) {
    pushSuggestion(suggestions, normalizedQuery, {
      type: "model",
      label: model.label,
      value: model.value,
      helper: "Modelo",
      params: { model: model.value },
    });
  }

  for (const category of filters.categories) {
    pushSuggestion(suggestions, normalizedQuery, {
      type: "category",
      label: category.label,
      value: category.value,
      helper: "Categoria",
      params: { category: category.value },
    });
  }

  return suggestions.slice(0, options.limit ?? 10);
}

export async function getProductDetail(
  slug: string,
  role: ViewerRole,
): Promise<ProductDetail | null> {
  let detail: ProductDetail | null;

  if (hasDatabaseUrl()) {
    try {
      detail = await getDbProductDetail(slug, role);
    } catch {
      detail = getSampleProductDetail(slug);
    }
  } else {
    detail = getSampleProductDetail(slug);
  }

  if (!detail) {
    return null;
  }

  return stripProductDetailPriceForRole(detail, role);
}

export async function getCategories() {
  if (!hasDatabaseUrl()) {
    return sampleCategories;
  }

  try {
    return await getDb()
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        imagePublicId: categories.imagePublicId,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
        isFeatured: categories.isFeatured,
        isActive: categories.isActive,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch {
    return sampleCategories;
  }
}

export async function getAdminCategories() {
  if (!hasDatabaseUrl()) {
    return sampleCategories.map((category) => ({
      ...category,
      parentId: null,
    }));
  }

  try {
    return await getDb()
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        imagePublicId: categories.imagePublicId,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
        isFeatured: categories.isFeatured,
        isActive: categories.isActive,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch {
    return sampleCategories.map((category) => ({
      ...category,
      parentId: null,
    }));
  }
}

export async function getAttributes() {
  if (!hasDatabaseUrl()) {
    return sampleAttributes;
  }

  try {
    return await getDb()
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
  } catch {
    return sampleAttributes;
  }
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

  try {
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
  } catch {
    return sampleAttributes.map((attribute) => ({
      ...attribute,
      options: sampleAttributeOptions
        .filter((option) => option.attributeId === attribute.id)
        .map(({ id, value, sortOrder }) => ({ id, value, sortOrder })),
    }));
  }
}

export async function getPublicProducts(query?: string) {
  const result = await getCatalogProducts({ role: "PUBLIC", search: query });
  return result.products;
}

export async function getPrivateProducts(query?: string) {
  const result = await getCatalogProducts({ role: "BUYER", search: query });
  return result.products as PrivateProduct[];
}

export async function getAdminProducts(
  filters: AdminProductFilters = {},
): Promise<AdminProduct[]> {
  let allProducts: AdminProduct[];

  if (hasDatabaseUrl()) {
    try {
      allProducts = await getDbAdminProducts();
    } catch {
      allProducts = getSampleAdminProducts();
    }
  } else {
    allProducts = getSampleAdminProducts();
  }

  return allProducts.filter((product) => {
    const search = normalize(filters.search);
    if (
      search &&
      ![
        product.name,
        product.slug,
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

    if (
      filters.categoryId &&
      product.mainCategoryId !== filters.categoryId &&
      !product.secondaryCategoryIds.includes(filters.categoryId)
    ) {
      return false;
    }

    if (filters.brand && normalize(product.brand) !== normalize(filters.brand)) {
      return false;
    }

    if (filters.stockMode && product.stockMode !== filters.stockMode) {
      return false;
    }

    if (filters.status === "active" && !product.isActive) {
      return false;
    }

    if (filters.status === "inactive" && product.isActive) {
      return false;
    }

    return true;
  });
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const products = await getAdminProducts();
  return products.find((product) => product.id === id) ?? null;
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

  try {
    const [productCount] = await getDb().select({ value: count() }).from(products);
    const [categoryCount] = await getDb().select({ value: count() }).from(categories);
    const [attributeCount] = await getDb().select({ value: count() }).from(attributes);

    return {
      products: productCount?.value ?? 0,
      categories: categoryCount?.value ?? 0,
      attributes: attributeCount?.value ?? 0,
      pendingRequests: 0,
    };
  } catch {
    return {
      products: sampleProducts.length,
      categories: sampleCategories.length,
      attributes: sampleAttributes.length,
      pendingRequests: 0,
    };
  }
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

async function getDbAdminProducts(): Promise<AdminProduct[]> {
  const productRows = await getDb()
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
      stockQuantity: products.stockQuantity,
      mainCategoryId: products.mainCategoryId,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.mainCategoryId))
    .orderBy(desc(products.isFeatured), asc(products.name));

  if (productRows.length === 0) {
    return [];
  }

  const ids = productRows.map((product) => product.id);
  const [imageRows, secondaryRows] = await Promise.all([
    getDb()
      .select({
        id: productImages.id,
        productId: productImages.productId,
        url: productImages.url,
        publicId: productImages.publicId,
        altText: productImages.altText,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(asc(productImages.sortOrder)),
    getDb()
      .select({
        productId: productCategories.productId,
        categoryId: productCategories.categoryId,
      })
      .from(productCategories)
      .where(inArray(productCategories.productId, ids)),
  ]);

  const adminProducts: AdminProduct[] = productRows.map((product) => ({
    ...product,
    price: product.price,
    imageUrl: imageRows.find((image) => image.productId === product.id)?.url ?? null,
    attributes: [],
    secondaryCategoryIds: secondaryRows
      .filter((row) => row.productId === product.id)
      .map((row) => row.categoryId),
    images: imageRows
      .filter((image) => image.productId === product.id)
      .map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        altText: image.altText,
        sortOrder: image.sortOrder,
      })),
  }));

  await attachDbAttributes(adminProducts);
  return adminProducts;
}

function getSampleAdminProducts(): AdminProduct[] {
  return sampleProducts.map((product) => ({
    ...product,
    price: product.price ?? "0.00",
    mainCategoryId: product.mainCategoryId,
    stockQuantity: product.stockMode === "TRACKED" ? 1 : 0,
    attributes: getSampleProductAttributes(product.id),
    secondaryCategoryIds: [],
    images: product.images,
  }));
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
  const search = tokenizeSearch(query.search);
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
    if (search.length > 0 && !matchesTechnicalSearch(product, search)) {
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

function normalizeForSearch(value: unknown) {
  const text = String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

  return {
    text: text.replace(/[^\p{Letter}\p{Number}]+/gu, " ").trim(),
    compact: text.replace(/[^\p{Letter}\p{Number}]+/gu, ""),
  };
}

function tokenizeSearch(value: unknown) {
  const normalized = normalizeForSearch(value);

  if (!normalized.text) {
    return [];
  }

  return normalized.text
    .split(/\s+/)
    .map((token) => normalizeForSearch(token))
    .filter((token) => token.text || token.compact);
}

function matchesTechnicalSearch(
  product: InternalCatalogProduct,
  tokens: Array<ReturnType<typeof normalizeForSearch>>,
) {
  const fields = [
    product.name,
    product.slug,
    product.brand,
    product.model,
    product.internalCode,
    product.oemCode,
    product.categoryName,
    product.categorySlug,
    product.shortDescription,
    ...product.attributes.flatMap((attribute) => [
      attribute.attributeName,
      attribute.attributeSlug,
      attribute.value,
      attribute.unit,
    ]),
  ]
    .filter(Boolean)
    .map(normalizeForSearch);

  return tokens.every((token) =>
    fields.some(
      (field) =>
        (token.text && field.text.includes(token.text)) ||
        (token.compact && field.compact.includes(token.compact)),
    ),
  );
}

function pushSuggestion(
  suggestions: CatalogSearchSuggestion[],
  query: ReturnType<typeof normalizeForSearch>,
  suggestion: CatalogSearchSuggestion,
) {
  const normalizedLabel = normalizeForSearch(suggestion.label);
  const normalizedHelper = normalizeForSearch(suggestion.helper);
  const matches =
    !query.text ||
    normalizedLabel.text.includes(query.text) ||
    normalizedLabel.compact.includes(query.compact) ||
    normalizedHelper.text.includes(query.text) ||
    normalizedHelper.compact.includes(query.compact);

  if (!matches) {
    return;
  }

  const key = `${suggestion.type}:${normalizeForSearch(suggestion.value).compact}`;

  if (
    suggestions.some(
      (item) => `${item.type}:${normalizeForSearch(item.value).compact}` === key,
    )
  ) {
    return;
  }

  suggestions.push(suggestion);
}
