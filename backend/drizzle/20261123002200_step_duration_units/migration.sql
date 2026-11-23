CREATE TYPE "duration_unit" AS ENUM('minutos', 'horas', 'dias', 'semanas', 'meses', 'anos');--> statement-breakpoint
ALTER TABLE "batch_step" ADD COLUMN "duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch_step" ADD COLUMN "duration_unit" "duration_unit" NOT NULL;--> statement-breakpoint
ALTER TABLE "step" ADD COLUMN "duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "step" ADD COLUMN "duration_unit" "duration_unit" NOT NULL;