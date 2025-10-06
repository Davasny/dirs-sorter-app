import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { user } from "@/features/auth/db";

export const projectsTable = pgTable("projects", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),

  name: text("name").notNull().unique(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id),
});
