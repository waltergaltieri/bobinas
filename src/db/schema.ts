import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profileRoleEnum = pgEnum("profile_role", ["ADMIN", "BUYER"]);
export const attributeTypeEnum = pgEnum("attribute_type", [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "SELECT",
  "MULTISELECT",
]);
export const stockModeEnum = pgEnum("stock_mode", [
  "TRACKED",
  "AVAILABLE",
  "ON_REQUEST",
  "OUT_OF_STOCK",
  "HIDDEN",
]);
export const productReviewStatusEnum = pgEnum("product_review_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const purchaseRequestStatusEnum = pgEnum("purchase_request_status", [
  "PENDING",
  "IN_REVIEW",
  "CONTACTED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NOT_COMPLETED",
]);
export const saleResultEnum = pgEnum("sale_result", [
  "UNKNOWN",
  "CONCRETED",
  "NOT_CONCRETED",
]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id").notNull(),
    role: profileRoleEnum("role").notNull().default("BUYER"),
    name: varchar("name", { length: 180 }).notNull(),
    companyName: varchar("company_name", { length: 180 }),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 80 }),
    cuit: varchar("cuit", { length: 32 }),
    address: text("address"),
    isActive: boolean("is_active").default(true).notNull(),
    internalNotes: text("internal_notes"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("profiles_auth_user_id_idx").on(table.authUserId),
    uniqueIndex("profiles_email_idx").on(table.email),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    imagePublicId: text("image_public_id"),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("categories_slug_idx").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    brand: varchar("brand", { length: 140 }),
    model: varchar("model", { length: 140 }),
    internalCode: varchar("internal_code", { length: 80 }).notNull(),
    oemCode: varchar("oem_code", { length: 120 }),
    mainCategoryId: uuid("main_category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    price: numeric("price", { precision: 12, scale: 2 }).default("0").notNull(),
    stockMode: stockModeEnum("stock_mode").default("ON_REQUEST").notNull(),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    reviewStatus: productReviewStatusEnum("review_status")
      .default("APPROVED")
      .notNull(),
    reviewNotes: text("review_notes"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_internal_code_idx").on(table.internalCode),
    index("products_main_category_idx").on(table.mainCategoryId),
    index("products_brand_idx").on(table.brand),
  ],
);

export const productImportMetadata = pgTable(
  "product_import_metadata",
  {
    productId: uuid("product_id")
      .primaryKey()
      .references(() => products.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 160 }).notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceExternalId: varchar("source_external_id", { length: 120 }).notNull(),
    sourceModifiedAt: timestamp("source_modified_at", { withTimezone: true }),
    importBatch: varchar("import_batch", { length: 120 }).notNull(),
    originalImageUrl: text("original_image_url"),
    requiresReview: boolean("requires_review").default(true).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("product_import_metadata_source_external_idx").on(
      table.source,
      table.sourceExternalId,
    ),
    index("product_import_metadata_batch_idx").on(table.importBatch),
  ],
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.categoryId] }),
    index("product_categories_category_idx").on(table.categoryId),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    altText: varchar("alt_text", { length: 220 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

export const attributes = pgTable(
  "attributes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    type: attributeTypeEnum("type").notNull(),
    unit: varchar("unit", { length: 40 }),
    isFilterable: boolean("is_filterable").default(false).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps(),
  },
  (table) => [uniqueIndex("attributes_slug_idx").on(table.slug)],
);

export const attributeOptions = pgTable(
  "attribute_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "cascade" }),
    value: varchar("value", { length: 180 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    index("attribute_options_attribute_idx").on(table.attributeId),
    uniqueIndex("attribute_options_attribute_value_idx").on(
      table.attributeId,
      table.value,
    ),
  ],
);

export const productAttributeValues = pgTable(
  "product_attribute_values",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "cascade" }),
    valueText: text("value_text"),
    valueNumber: numeric("value_number", { precision: 12, scale: 3 }),
    valueBoolean: boolean("value_boolean"),
    optionId: uuid("option_id").references(() => attributeOptions.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("product_attribute_values_product_idx").on(table.productId),
    index("product_attribute_values_attribute_idx").on(table.attributeId),
  ],
);

export const purchaseRequests = pgTable(
  "purchase_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    status: purchaseRequestStatusEnum("status").default("PENDING").notNull(),
    estimatedTotal: numeric("estimated_total", { precision: 12, scale: 2 })
      .default("0")
      .notNull(),
    buyerNotes: text("buyer_notes"),
    adminNotes: text("admin_notes"),
    saleResult: saleResultEnum("sale_result").default("UNKNOWN").notNull(),
    saleResultNotes: text("sale_result_notes"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    index("purchase_requests_buyer_idx").on(table.buyerId),
    index("purchase_requests_status_idx").on(table.status),
  ],
);

export const purchaseRequestItems = pgTable(
  "purchase_request_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purchaseRequestId: uuid("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productNameSnapshot: varchar("product_name_snapshot", { length: 220 }).notNull(),
    productCodeSnapshot: varchar("product_code_snapshot", { length: 80 }).notNull(),
    unitPriceSnapshot: numeric("unit_price_snapshot", {
      precision: 12,
      scale: 2,
    }).notNull(),
    quantity: integer("quantity").notNull(),
    subtotalSnapshot: numeric("subtotal_snapshot", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [index("purchase_request_items_request_idx").on(table.purchaseRequestId)],
);

export const homeSlides = pgTable("home_slides", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  subtitle: text("subtitle"),
  buttonText: varchar("button_text", { length: 80 }),
  buttonLink: text("button_link"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps(),
});

export const popupSettings = pgTable("popup_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  isActive: boolean("is_active").default(false).notNull(),
  imageUrl: text("image_url"),
  imagePublicId: text("image_public_id"),
  title: varchar("title", { length: 180 }),
  text: text("text"),
  buttonText: varchar("button_text", { length: 80 }),
  buttonLink: text("button_link"),
  showOnce: boolean("show_once").default(true).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: varchar("business_name", { length: 180 }).notNull(),
  logoUrl: text("logo_url"),
  logoPublicId: text("logo_public_id"),
  whatsapp: varchar("whatsapp", { length: 80 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 80 }),
  address: text("address"),
  businessHours: text("business_hours"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  institutionalText: text("institutional_text"),
  footerText: text("footer_text"),
  seoTitle: varchar("seo_title", { length: 180 }),
  seoDescription: text("seo_description"),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps(),
});

export const productViews = pgTable(
  "product_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    sessionId: varchar("session_id", { length: 160 }),
    userRole: varchar("user_role", { length: 40 }),
    sourcePath: text("source_path"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_views_product_idx").on(table.productId),
    index("product_views_created_at_idx").on(table.createdAt),
  ],
);

export const searchLogs = pgTable(
  "search_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    query: text("query").notNull(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
    sessionId: varchar("session_id", { length: 160 }),
    filtersJson: text("filters_json"),
    sourcePath: text("source_path"),
    resultsCount: integer("results_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("search_logs_created_at_idx").on(table.createdAt)],
);

export const requestEvents = pgTable(
  "request_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    buyerId: uuid("buyer_id").references(() => profiles.id, { onDelete: "set null" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    purchaseRequestId: uuid("purchase_request_id").references(() => purchaseRequests.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity"),
    sessionId: varchar("session_id", { length: 160 }),
    sourcePath: text("source_path"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("request_events_type_idx").on(table.eventType),
    index("request_events_buyer_idx").on(table.buyerId),
    index("request_events_product_idx").on(table.productId),
    index("request_events_created_at_idx").on(table.createdAt),
  ],
);

export type ProfileRole = (typeof profileRoleEnum.enumValues)[number];
export type AttributeType = (typeof attributeTypeEnum.enumValues)[number];
export type StockMode = (typeof stockModeEnum.enumValues)[number];
export type ProductReviewStatus =
  (typeof productReviewStatusEnum.enumValues)[number];
export type PurchaseRequestStatus =
  (typeof purchaseRequestStatusEnum.enumValues)[number];
export type SaleResult = (typeof saleResultEnum.enumValues)[number];
