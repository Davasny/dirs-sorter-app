import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { projectsTable } from "@/features/projects/db";

export const filesTable = pgTable(
  "files",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),

    projectId: uuid("project_id")
      .references(() => projectsTable.id)
      .notNull(),

    filePath: text("file_path").notNull(),
  },
  (table) => ({
    uniqueFilePathPerProject: uniqueIndex("unique_file_path_per_project").on(
      table.projectId,
      table.filePath,
    ),
  }),
);
