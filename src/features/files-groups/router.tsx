import path from "node:path";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike } from "drizzle-orm";
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
      const [newGroup] = await db
        .insert(filesGroupsTable)
        .values({
          name: ctx.input.name,
          projectId: ctx.input.projectId,
        })
        .returning();

      return newGroup;
    }),

  assignAllFolderFilesToGroup: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
        projectId: z.string(),
        groupId: z.string().nullable(),
      }),
    )
    .mutation(async (ctx) => {
      const [file] = await db
        .select()
        .from(filesTable)
        .where(eq(filesTable.id, ctx.input.fileId));

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const folder = path.dirname(file.filePath);

      await db
        .update(filesTable)
        .set({ groupId: ctx.input.groupId })
        .where(
          and(
            ilike(filesTable.filePath, `${folder}/%`),
            eq(filesTable.projectId, ctx.input.projectId),
          ),
        );
    }),

  listFilesInGroup: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        projectId: z.string(),
      }))
    .query(async (ctx) => {
      return db
        .select()
        .from(filesTable)
        .where(
          and(
            eq(filesTable.groupId, ctx.input.groupId),
            eq(filesTable.projectId, ctx.input.projectId),
          ),
        );
    })
});
