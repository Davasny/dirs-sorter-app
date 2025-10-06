import { eq } from "drizzle-orm";
import { z } from "zod";
import { filesTable } from "@/features/project-files/db";
import { projectsTable } from "@/features/projects/db";
import { db } from "@/lib/db/client";
import { projectProcedure, protectedProcedure, router } from "@/lib/trpc/trpc";

export const projectsRouter = router({
  listProjects: protectedProcedure.query(async (ctx) => {
    return db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.ownerId, ctx.ctx.user.id));
  }),

  getProject: projectProcedure.query(async (ctx) => {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, ctx.input.projectId));

    if (!project) {
      return null;
    }

    return project;
  }),

  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async (ctx) => {
      return db.insert(projectsTable).values({
        name: ctx.input.name,
        ownerId: ctx.ctx.user.id,
      });
    }),

  deleteProject: projectProcedure.mutation(async (ctx) => {
    await db
      .update(filesTable)
      .set({deletedAt: new Date()})
      .where(eq(filesTable.projectId, ctx.input.projectId));

    await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, ctx.input.projectId));
  }),
});
