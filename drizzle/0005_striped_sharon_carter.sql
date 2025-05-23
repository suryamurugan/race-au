ALTER TABLE "task_submissions" ALTER COLUMN "answer" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "answer_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "correct_answer" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "options" jsonb;