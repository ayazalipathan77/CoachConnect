CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD COLUMN "free_intro_month_key" varchar(7);--> statement-breakpoint
CREATE INDEX "users_name_trgm_idx" ON "users" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "users_city_trgm_idx" ON "users" USING gin ("location_city" gin_trgm_ops);