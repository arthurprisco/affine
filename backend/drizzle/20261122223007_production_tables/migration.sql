CREATE TABLE "batch" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"code" text NOT NULL,
	"quantity" numeric(10,2) NOT NULL,
	"unit" text NOT NULL,
	"start_date" date NOT NULL,
	"expiration_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batch_user_code_uq" UNIQUE("user_id","code")
);
--> statement-breakpoint
CREATE TABLE "batch_step" (
	"id" text PRIMARY KEY,
	"batch_id" text NOT NULL,
	"step_id" text,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"duration_days" integer NOT NULL,
	"planned_date" date NOT NULL,
	"completed_at" date,
	"notes" text,
	CONSTRAINT "batch_step_batch_position_uq" UNIQUE("batch_id","position")
);
--> statement-breakpoint
CREATE TABLE "recipe" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"maturation_days" integer NOT NULL,
	"shelf_life_days" integer NOT NULL,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step" (
	"id" text PRIMARY KEY,
	"recipe_id" text NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"duration_days" integer NOT NULL,
	"description" text,
	CONSTRAINT "step_recipe_position_uq" UNIQUE("recipe_id","position")
);
--> statement-breakpoint
CREATE INDEX "batch_userId_idx" ON "batch" ("user_id");--> statement-breakpoint
CREATE INDEX "batch_recipeId_idx" ON "batch" ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_userId_idx" ON "recipe" ("user_id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_recipe_id_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "batch_step" ADD CONSTRAINT "batch_step_batch_id_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "batch_step" ADD CONSTRAINT "batch_step_step_id_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "step"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "step" ADD CONSTRAINT "step_recipe_id_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipe"("id") ON DELETE CASCADE;