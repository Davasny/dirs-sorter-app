ALTER TABLE "files_groups" DROP CONSTRAINT "files_groups_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "files_groups" ADD CONSTRAINT "files_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;