import { z } from "zod";
import { projectsTable } from "@/features/projects/db";
import { db } from "@/lib/db/client";
import { publicProcedure, router } from "@/lib/trpc/trpc";

export const projectsRouter = router({
  listProjects: publicProcedure.query(async () => {
    return db.select().from(projectsTable);
  }),

  createProject: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async (ctx) => {
      return db
        .insert(projectsTable)
        .values({
          name: ctx.input.name,
        })
    }),
});
