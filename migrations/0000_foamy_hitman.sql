CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"program_id" integer NOT NULL,
	"status" text DEFAULT 'active',
	"progress" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"location" text NOT NULL,
	"image_url" text,
	"host_id" integer NOT NULL,
	"tier_required" text DEFAULT 'free',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fitness_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"coach_id" integer NOT NULL,
	"difficulty" text,
	"duration_weeks" integer,
	"thumbnail_url" text
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"is_private" boolean DEFAULT false,
	"tier_required" text DEFAULT 'free',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"lat" numeric NOT NULL,
	"lng" numeric NOT NULL,
	"is_partner" boolean DEFAULT false,
	"website" text
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"group_id" integer,
	"content" text NOT NULL,
	"media_url" text,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric NOT NULL,
	"image_url" text,
	"category" text,
	"shopify_id" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"location" text,
	"stage" text,
	"interests" text[],
	"bio" text,
	"photo_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
