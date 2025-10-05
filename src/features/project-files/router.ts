import { readFile } from "node:fs/promises";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { filesTable } from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { publicProcedure, router } from "@/lib/trpc/trpc";

export const projectFilesRouter = router({
  listFiles: publicProcedure
    .input(z.object({ projectId: z.uuidv7() }))
    .query(async (ctx) => {
      return db
        .select()
        .from(filesTable)
        .where(eq(filesTable.projectId, ctx.input.projectId));
    }),

  getFileMetadata: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
        projectId: z.string(),
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
          ),
        );

      if (!file) return null;

      return file;
    }),

  getFileContent: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
        projectId: z.string(),
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
          ),
        );

      if (!file) return null;

      const content = await readFile(file.serverPath);
      return {
        fileContent: content.toString("base64"),
      };
    }),
});
