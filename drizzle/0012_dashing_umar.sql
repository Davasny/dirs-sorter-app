ALTER TABLE "projects"
    ADD COLUMN "owner_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "projects"
    ADD CONSTRAINT "projects_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user" ("id") ON DELETE no action ON UPDATE no action;