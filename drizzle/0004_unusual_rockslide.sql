ALTER TABLE "tasks" ALTER COLUMN "description" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "description" SET DEFAULT '{}'::jsonb;