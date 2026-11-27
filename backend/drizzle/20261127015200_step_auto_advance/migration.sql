ALTER TABLE "batch_step" ADD COLUMN "auto_advance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "step" ADD COLUMN "auto_advance" boolean DEFAULT false NOT NULL;