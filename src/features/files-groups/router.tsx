import path from "node:path";
import { TRPCError } from "@trpc/server";
import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { filesGroupsTable } from "@/features/files-groups/db";
import { groupSchema } from "@/features/files-groups/schemas";
import { filesTable } from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { projectProcedure, router } from "@/lib/trpc/trpc";

export const filesGroupsRouter = router({
  listGroups: projectProcedure.query(async (ctx) => {
    return db
      .select()
      .from(filesGroupsTable)
      .where(eq(filesGroupsTable.projectId, ctx.input.projectId));
  }),

  createGroup: projectProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
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

  updateGroups: projectProcedure
    .input(
      z.object({
        groups: z.array(groupSchema).min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const { projectId, groups } = input;

      const items = groups.map((group) => ({
        ...group,
        projectId,
      }));

      logger.info({
        msg: "Updating file groups",
        projectId,
        items,
      });

      await db.transaction(async (tx) => {
        // upsert items
        await tx
          .insert(filesGroupsTable)
          .values(items)
          .onConflictDoUpdate({
            target: filesGroupsTable.id,
            set: {
              name: sql`excluded.name`,
            },
          });

        // fetch existing groups for the project
        const existingGroups = await tx
          .select()
          .from(filesGroupsTable)
          .where(eq(filesGroupsTable.projectId, projectId));

        // figure out which names to remove
        const toRemoveNames = existingGroups.filter(
          (group) => !items.some((item) => item.name === group.name),
        );

        if (toRemoveNames.length) {
          logger.info({
            msg: "Removing file groups",
            projectId,
            toRemoveNames,
          });

          // check if any files are assigned to these groups
          const assignedFiles = await tx
            .select()
            .from(filesTable)
            .where(
              and(
                inArray(
                  filesTable.groupId,
                  toRemoveNames.map((g) => g.id),
                ),
                eq(filesTable.projectId, projectId),
              ),
            );

          if (assignedFiles.length) {
            throw new Error(
              "Nie można usunąć grup, które są przypisane do plików",
            );
          }

          // remove groups not in new list
          await tx.delete(filesGroupsTable).where(
            and(
              inArray(
                filesGroupsTable.name,
                toRemoveNames.map((g) => g.name),
              ),
              eq(filesGroupsTable.projectId, projectId),
            ),
          );
        }
      });
    }),

  assignAllFolderFilesToGroup: projectProcedure
    .input(
      z.object({
        fileId: z.string(),
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

      // Use posix to ensure forward slashes
      const folder = path.posix.dirname(file.filePath || "");
      const isRoot = folder === "." || folder === "";

      // Build the folder predicate:
      // - If root: filePath has no '/' at all (root-level files only)
      // - Else: filePath starts with `${folder}/` (all files in that folder and below)
      const folderPredicate = isRoot
        ? sql`POSITION('/' IN
              ${filesTable.filePath}
              )
              =
              0`
        : ilike(filesTable.filePath, `${folder}/%`);

      await db
        .update(filesTable)
        .set({ groupId: ctx.input.groupId })
        .where(
          and(folderPredicate, eq(filesTable.projectId, ctx.input.projectId)),
        );
    }),

  listFilesInGroup: projectProcedure
    .input(
      z.object({
        groupId: z.string(),
      }),
    )
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
    }),
});
