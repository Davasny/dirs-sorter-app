import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { filesTable } from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { projectProcedure, router } from "@/lib/trpc/trpc";

export const projectFilesRouter = router({
  listFiles: projectProcedure.query(async (ctx) => {
    return db
      .select()
      .from(filesTable)
      .where(
        and(
          eq(filesTable.projectId, ctx.input.projectId),
          isNull(filesTable.deletedAt),
        ),
      )
      .orderBy(filesTable.filePath);
  }),

  getFileMetadata: projectProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .query(async (ctx) => {
      const [file] = await db
        .select()
        .from(filesTable)
        .where(
          and(
            eq(filesTable.id, ctx.input.fileId),
            eq(filesTable.projectId, ctx.input.projectId),
            isNull(filesTable.deletedAt),
          ),
        );

      if (!file) return null;

      return file;
    }),

  getNextFolderId: projectProcedure
    .input(
      z.object({
        currentFileId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const files = await db
        .select()
        .from(filesTable)
        .where(eq(filesTable.projectId, input.projectId))
        .orderBy(filesTable.filePath);

      if (files.length === 0) {
        return null;
      }

      const currentIndex = files.findIndex(
        (file) => file.id === input.currentFileId,
      );
      if (currentIndex === -1) {
        return null;
      }

      const getFolderPath = (filePath: string) => {
        const parts = filePath.split("/");
        return parts.slice(0, -1).join("/"); // everything except the file name
      };

      const currentFolder = getFolderPath(files[currentIndex].filePath);

      // Find the next file whose folder differs from currentFolder
      const nextFolderFile = files.slice(currentIndex + 1).find((file) => {
        const folder = getFolderPath(file.filePath);
        return folder && folder !== currentFolder;
      });

      return nextFolderFile ? nextFolderFile.id : null;
    }),
});
