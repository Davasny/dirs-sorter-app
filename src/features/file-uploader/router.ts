import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { filesTable, type IProjectFileInsert } from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { publicProcedure, router } from "@/lib/trpc/trpc";

export const fileUploaderRouter = router({
  upload: publicProcedure
    .input(
      z.object({
        zipContent: z.string(), // base64-encoded ZIP content
        projectId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { zipContent, projectId } = input;

      const id = uuidv7();
      const dir = path.join(process.cwd(), "uploads");
      const filePath = path.join(dir, `${id}.zip`);

      await fs.mkdir(dir, { recursive: true });

      const zipBuffer = Buffer.from(zipContent, "base64");
      await fs.writeFile(filePath, zipBuffer);

      logger.info({ msg: "File uploaded", id, filePath });

      const extractDir = path.join(dir, id);
      await fs.mkdir(extractDir, { recursive: true });

      const zip = await JSZip.loadAsync(zipBuffer);
      const newFiles: IProjectFileInsert[] = [];

      const topLevelPrefix = (() => {
        const firstEntry = Object.keys(zip.files)[0];
        const match = firstEntry.match(/^([^/]+)\//);
        return match ? match[1] : null;
      })();

      await Promise.all(
        Object.entries(zip.files).map(async ([filename, file]) => {
          const cleanName =
            topLevelPrefix && filename.startsWith(`${topLevelPrefix}/`)
              ? filename.slice(topLevelPrefix.length + 1)
              : filename;

          if (!cleanName) return; // skip empty paths (top-level folder itself)

          const destPath = path.join(extractDir, cleanName);

          if (file.dir) {
            await fs.mkdir(destPath, { recursive: true });
          } else {
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            const content = await file.async("nodebuffer");
            await fs.writeFile(destPath, content);
          }

          newFiles.push({
            filePath: cleanName,
            projectId,
            serverPath: destPath,
          });
        }),
      );

      await db.insert(filesTable).values(newFiles).onConflictDoNothing();

      return { id, filePath };
    }),
});
