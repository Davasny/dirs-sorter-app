import { eq } from "drizzle-orm";
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
});
