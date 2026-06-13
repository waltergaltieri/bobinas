CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_name" varchar(180) NOT NULL,
	"logo_url" text,
	"logo_public_id" text,
	"whatsapp" varchar(80),
	"email" varchar(255),
	"phone" varchar(80),
	"address" text,
	"business_hours" text,
	"instagram_url" text,
	"facebook_url" text,
	"institutional_text" text,
	"footer_text" text,
	"seo_title" varchar(180),
	"seo_description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;