CREATE TYPE "public"."attribute_type" AS ENUM('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT');--> statement-breakpoint
CREATE TYPE "public"."profile_role" AS ENUM('ADMIN', 'BUYER');--> statement-breakpoint
CREATE TYPE "public"."purchase_request_status" AS ENUM('PENDING', 'IN_REVIEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOT_COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."sale_result" AS ENUM('UNKNOWN', 'CONCRETED', 'NOT_CONCRETED');--> statement-breakpoint
CREATE TYPE "public"."stock_mode" AS ENUM('TRACKED', 'AVAILABLE', 'ON_REQUEST', 'OUT_OF_STOCK', 'HIDDEN');--> statement-breakpoint
CREATE TABLE "attribute_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value" varchar(180) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"type" "attribute_type" NOT NULL,
	"unit" varchar(40),
	"is_filterable" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"image_url" text,
	"image_public_id" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" text NOT NULL,
	"title" varchar(180) NOT NULL,
	"subtitle" text,
	"button_text" varchar(80),
	"button_link" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "popup_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"image_public_id" text,
	"title" varchar(180),
	"text" text,
	"button_text" varchar(80),
	"button_link" text,
	"show_once" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attribute_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value_text" text,
	"value_number" numeric(12, 3),
	"value_boolean" boolean,
	"option_id" uuid
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "product_categories_product_id_category_id_pk" PRIMARY KEY("product_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"public_id" text NOT NULL,
	"alt_text" varchar(220),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid,
	"session_id" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(220) NOT NULL,
	"slug" varchar(240) NOT NULL,
	"short_description" text,
	"description" text,
	"brand" varchar(140),
	"model" varchar(140),
	"internal_code" varchar(80) NOT NULL,
	"oem_code" varchar(120),
	"main_category_id" uuid,
	"price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"stock_mode" "stock_mode" DEFAULT 'ON_REQUEST' NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"role" "profile_role" DEFAULT 'BUYER' NOT NULL,
	"name" varchar(180) NOT NULL,
	"company_name" varchar(180),
	"email" varchar(255) NOT NULL,
	"phone" varchar(80),
	"cuit" varchar(32),
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"product_id" uuid,
	"product_name_snapshot" varchar(220) NOT NULL,
	"product_code_snapshot" varchar(80) NOT NULL,
	"unit_price_snapshot" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"subtotal_snapshot" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"status" "purchase_request_status" DEFAULT 'PENDING' NOT NULL,
	"estimated_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"buyer_notes" text,
	"admin_notes" text,
	"sale_result" "sale_result" DEFAULT 'UNKNOWN' NOT NULL,
	"sale_result_notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"user_id" uuid,
	"session_id" varchar(160),
	"results_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attribute_options" ADD CONSTRAINT "attribute_options_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_option_id_attribute_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."attribute_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_main_category_id_categories_id_fk" FOREIGN KEY ("main_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_buyer_id_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attribute_options_attribute_idx" ON "attribute_options" USING btree ("attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attribute_options_attribute_value_idx" ON "attribute_options" USING btree ("attribute_id","value");--> statement-breakpoint
CREATE UNIQUE INDEX "attributes_slug_idx" ON "attributes" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "product_attribute_values_product_idx" ON "product_attribute_values" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_attribute_values_attribute_idx" ON "product_attribute_values" USING btree ("attribute_id");--> statement-breakpoint
CREATE INDEX "product_categories_category_idx" ON "product_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_views_product_idx" ON "product_views" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_views_created_at_idx" ON "product_views" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "products_internal_code_idx" ON "products" USING btree ("internal_code");--> statement-breakpoint
CREATE INDEX "products_main_category_idx" ON "products" USING btree ("main_category_id");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_auth_user_id_idx" ON "profiles" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "purchase_request_items_request_idx" ON "purchase_request_items" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE INDEX "purchase_requests_buyer_idx" ON "purchase_requests" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "purchase_requests_status_idx" ON "purchase_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "search_logs_created_at_idx" ON "search_logs" USING btree ("created_at");