import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { projectsTable } from "@/features/projects/db";

export const filesGroupsTable = pgTable(
  "files_groups",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),

    name: text("name").notNull(),

    projectId: uuid("project_id")
      .references(() => projectsTable.id)
      .notNull(),
  },
  (table) => ({
    uniqueNamePerProject: uniqueIndex("unique_name_per_project").on(
      table.name,
      table.projectId,
    ),
  }),
);

export type IFilesGroup = typeof filesGroupsTable.$inferSelect;
