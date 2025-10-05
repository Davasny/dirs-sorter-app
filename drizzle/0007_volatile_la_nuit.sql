CREATE TABLE "files_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" uuid NOT NULL,
	"project_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "files_groups" ADD CONSTRAINT "files_groups_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_group_id_files_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."files_groups"("id") ON DELETE no action ON UPDATE no action;