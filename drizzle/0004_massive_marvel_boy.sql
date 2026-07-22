CREATE TYPE "public"."product_review_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "product_import_metadata" (
	"product_id" uuid PRIMARY KEY NOT NULL,
	"source" varchar(160) NOT NULL,
	"source_url" text NOT NULL,
	"source_external_id" varchar(120) NOT NULL,
	"source_modified_at" timestamp with time zone,
	"import_batch" varchar(120) NOT NULL,
	"original_image_url" text,
	"requires_review" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "review_status" "product_review_status" DEFAULT 'APPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "review_notes" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "product_import_metadata" ADD CONSTRAINT "product_import_metadata_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_import_metadata_source_external_idx" ON "product_import_metadata" USING btree ("source","source_external_id");--> statement-breakpoint
CREATE INDEX "product_import_metadata_batch_idx" ON "product_import_metadata" USING btree ("import_batch");
--> statement-breakpoint
ALTER TABLE public.product_import_metadata ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE public.product_import_metadata FROM anon, authenticated;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_import_metadata TO service_role;
