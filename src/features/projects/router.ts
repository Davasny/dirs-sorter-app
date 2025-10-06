import { eq } from "drizzle-orm";
import { z } from "zod";
import { filesTable } from "@/features/project-files/db";
import { projectsTable } from "@/features/projects/db";
import { db } from "@/lib/db/client";
import { publicProcedure, router } from "@/lib/trpc/trpc";

export const projectsRouter = router({
  listProjects: publicProcedure.query(async () => {
    return db.select().from(projectsTable);
  }),

  getProject: publicProcedure
    .input(
      z.object({
        projectId: z.uuidv7(),
      }),
    )
    .query(async (ctx) => {
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, ctx.input.projectId));

      if (!project) {
        return null;
      }

      return project;
    }),

  createProject: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async (ctx) => {
      return db.insert(projectsTable).values({
        name: ctx.input.name,
      });
    }),

  deleteProject: publicProcedure
    .input(
      z.object({
        projectId: z.uuidv7(),
      }),
    )
    .mutation(async (ctx) => {
      await db
        .update(filesTable)
        .set({ deletedAt: new Date() })
        .where(eq(filesTable.projectId, ctx.input.projectId));

      await db
        .delete(projectsTable)
        .where(eq(projectsTable.id, ctx.input.projectId));
    }),
});
