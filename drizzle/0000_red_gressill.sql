CREATE TYPE "public"."booking_status" AS ENUM('pending_payment', 'confirmed', 'completed', 'cancelled_by_client', 'cancelled_by_coach', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."coach_status" AS ENUM('pending_review', 'active', 'paused', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner_friendly', 'intermediate', 'advanced', 'elite');--> statement-breakpoint
CREATE TYPE "public"."media_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('video', 'document', 'image');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'push', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."profile_visibility" AS ENUM('public', 'unlisted', 'paused');--> statement-breakpoint
CREATE TYPE "public"."recurring_kind" AS ENUM('one_off', 'weekly', 'biweekly');--> statement-breakpoint
CREATE TYPE "public"."slot_status" AS ENUM('open', 'booked', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('coach', 'client', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"slot_id" text NOT NULL,
	"client_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"status" "booking_status" DEFAULT 'pending_payment' NOT NULL,
	"coach_fee_minor" integer NOT NULL,
	"service_fee_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"payment_ref" text,
	"payment_intent_id" text,
	"client_message" text,
	"refund_minor" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_preferred_sports" (
	"client_id" text NOT NULL,
	"sport_id" text NOT NULL,
	CONSTRAINT "client_preferred_sports_client_id_sport_id_pk" PRIMARY KEY("client_id","sport_id")
);
--> statement-breakpoint
CREATE TABLE "client_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"dob" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"headline" varchar(160),
	"bio" text,
	"philosophy" text,
	"achievements" text,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"experience_level" "experience_level" DEFAULT 'intermediate' NOT NULL,
	"default_rate_minor" integer,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" "coach_status" DEFAULT 'pending_review' NOT NULL,
	"visibility" "profile_visibility" DEFAULT 'public' NOT NULL,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"completeness" integer DEFAULT 0 NOT NULL,
	"free_intro_used_month" integer DEFAULT 0 NOT NULL,
	"rating_avg" double precision DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"cancellation_strikes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_sports" (
	"coach_id" text NOT NULL,
	"sport_id" text NOT NULL,
	CONSTRAINT "coach_sports_coach_id_sport_id_pk" PRIMARY KEY("coach_id","sport_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"coach_user_id" text NOT NULL,
	"client_user_id" text NOT NULL,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"type" "media_type" NOT NULL,
	"provider" varchar(40) DEFAULT 'cloudinary' NOT NULL,
	"url" text NOT NULL,
	"public_id" text,
	"title" varchar(200),
	"status" "media_status" DEFAULT 'pending' NOT NULL,
	"size_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(60) NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text,
	"data" jsonb,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"client_id" text NOT NULL,
	"coach_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"coach_response" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" text PRIMARY KEY NOT NULL,
	"coach_id" text NOT NULL,
	"venue_id" text,
	"sport_id" text,
	"start_at" timestamp with time zone NOT NULL,
	"duration_min" integer NOT NULL,
	"session_type" varchar(80) NOT NULL,
	"max_participants" integer DEFAULT 1 NOT NULL,
	"fee_minor" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"description" text,
	"status" "slot_status" DEFAULT 'open' NOT NULL,
	"recurring" "recurring_kind" DEFAULT 'one_off' NOT NULL,
	"recurring_group_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sports" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"category" varchar(80) NOT NULL,
	"icon" varchar(80),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"password_hash" text,
	"location_city" varchar(120),
	"location_postcode" varchar(16),
	"lat" double precision,
	"lng" double precision,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" text PRIMARY KEY NOT NULL,
	"coach_id" text NOT NULL,
	"name" varchar(160) NOT NULL,
	"address" text,
	"city" varchar(120),
	"postcode" varchar(16),
	"lat" double precision,
	"lng" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_preferred_sports" ADD CONSTRAINT "client_preferred_sports_client_id_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_preferred_sports" ADD CONSTRAINT "client_preferred_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_sports" ADD CONSTRAINT "coach_sports_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_sports" ADD CONSTRAINT "coach_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_coach_user_id_users_id_fk" FOREIGN KEY ("coach_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_client_profiles_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_client_idx" ON "bookings" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "bookings_coach_idx" ON "bookings" USING btree ("coach_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_slot_active_uniq" ON "bookings" USING btree ("slot_id") WHERE status in ('pending_payment','confirmed','completed');--> statement-breakpoint
CREATE UNIQUE INDEX "client_profiles_user_uniq" ON "client_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coach_profiles_user_uniq" ON "coach_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "coach_profiles_status_idx" ON "coach_profiles" USING btree ("status","visibility");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_pair_uniq" ON "conversations" USING btree ("coach_user_id","client_user_id");--> statement-breakpoint
CREATE INDEX "media_owner_idx" ON "media" USING btree ("owner_id","type");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_booking_uniq" ON "reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "reviews_coach_idx" ON "reviews" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "slots_coach_idx" ON "slots" USING btree ("coach_id","start_at");--> statement-breakpoint
CREATE INDEX "slots_discovery_idx" ON "slots" USING btree ("status","start_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sports_slug_uniq" ON "sports" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uniq" ON "users" USING btree ("email");