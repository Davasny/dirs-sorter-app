import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const projectsTable = pgTable("projects", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),

  name: text("name").notNull().unique(),
});
