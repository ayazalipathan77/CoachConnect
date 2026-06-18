CREATE TYPE "public"."discount_type" AS ENUM('early_bird', 'flat_percent');--> statement-breakpoint
CREATE TYPE "public"."featured_promotion_status" AS ENUM('pending_payment', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method_kind" AS ENUM('card', 'bank');--> statement-breakpoint
CREATE TABLE "client_payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"kind" "payment_method_kind" NOT NULL,
	"brand" varchar(40),
	"last4" varchar(4),
	"exp_month" integer,
	"exp_year" integer,
	"bank_name" varchar(160),
	"account_holder_name" varchar(160),
	"account_last4" varchar(4),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"coach_id" text NOT NULL,
	"slot_id" text,
	"label" varchar(120) NOT NULL,
	"type" "discount_type" NOT NULL,
	"percent_off" integer NOT NULL,
	"min_days_before_start" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featured_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"key" varchar(40) NOT NULL,
	"label" varchar(120) NOT NULL,
	"duration_days" integer NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featured_promotions" (
	"id" text PRIMARY KEY NOT NULL,
	"coach_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"start_at" timestamp,
	"end_at" timestamp,
	"amount_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" "featured_promotion_status" DEFAULT 'pending_payment' NOT NULL,
	"payment_intent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"platform_commission_rate" double precision,
	"platform_min_fee_minor" integer,
	"stripe_account_label" varchar(160),
	"support_email" varchar(200),
	"payout_instructions" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "discount_minor" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "featured_until" timestamp;--> statement-breakpoint
ALTER TABLE "client_payment_methods" ADD CONSTRAINT "client_payment_methods_client_id_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_promotions" ADD CONSTRAINT "featured_promotions_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_promotions" ADD CONSTRAINT "featured_promotions_plan_id_featured_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."featured_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_payment_methods_client_idx" ON "client_payment_methods" USING btree ("client_id","kind");--> statement-breakpoint
CREATE INDEX "discount_rules_coach_idx" ON "discount_rules" USING btree ("coach_id","active");--> statement-breakpoint
CREATE UNIQUE INDEX "featured_plans_key_uniq" ON "featured_plans" USING btree ("key");--> statement-breakpoint
CREATE INDEX "featured_promotions_coach_idx" ON "featured_promotions" USING btree ("coach_id","status");--> statement-breakpoint
CREATE INDEX "coach_profiles_featured_idx" ON "coach_profiles" USING btree ("featured_until");