import { eq } from "drizzle-orm";
import { z } from "zod";
import { filesGroupsTable } from "@/features/files-groups/db";
import { filesTable } from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { publicProcedure, router } from "@/lib/trpc/trpc";

export const filesGroupsRouter = router({
  listGroups: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async (ctx) => {
      return db
        .select()
        .from(filesGroupsTable)
        .where(eq(filesGroupsTable.projectId, ctx.input.projectId));
    }),

  createGroup: publicProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        projectId: z.string(),
      }),
    )
    .mutation(async (ctx) => {
      const newGroup = await db
        .insert(filesGroupsTable)
        .values({
          name: ctx.input.name,
          projectId: ctx.input.projectId,
        })
        .returning();

      return newGroup[0];
    }),

  assignFileToGroup: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
        groupId: z.string().nullable(),
      }),
    )
    .mutation(async (ctx) => {
      await db
        .update(filesTable)
        .set({ groupId: ctx.input.groupId })
        .where(eq(filesTable.id, ctx.input.fileId));
    }),
});
