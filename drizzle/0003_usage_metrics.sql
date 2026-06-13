CREATE TABLE "request_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(80) NOT NULL,
	"buyer_id" uuid,
	"product_id" uuid,
	"purchase_request_id" uuid,
	"quantity" integer,
	"session_id" varchar(160),
	"source_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_views" ADD COLUMN "user_role" varchar(40);--> statement-breakpoint
ALTER TABLE "product_views" ADD COLUMN "source_path" text;--> statement-breakpoint
ALTER TABLE "search_logs" ADD COLUMN "filters_json" text;--> statement-breakpoint
ALTER TABLE "search_logs" ADD COLUMN "source_path" text;--> statement-breakpoint
ALTER TABLE "request_events" ADD CONSTRAINT "request_events_buyer_id_profiles_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_events" ADD CONSTRAINT "request_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_events" ADD CONSTRAINT "request_events_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "request_events_type_idx" ON "request_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "request_events_buyer_idx" ON "request_events" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "request_events_product_idx" ON "request_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "request_events_created_at_idx" ON "request_events" USING btree ("created_at");