import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { projectsTable } from "@/features/projects/db";
import { filesGroupsTable } from "@/features/files-groups/db";

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

    serverPath: text("server_path").unique().notNull(),

    mimeType: text("mime_type"),

    groupId: uuid("group_id").references(() => filesGroupsTable.id),
  },
  (table) => ({
    uniqueFilePathPerProject: uniqueIndex("unique_file_path_per_project").on(
      table.projectId,
      table.filePath,
    ),
  }),
);

export type IProjectFile = typeof filesTable.$inferSelect;
export type IProjectFileInsert = typeof filesTable.$inferInsert;
