import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import {
  filesTable,
  type IProjectFileInsert,
} from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { publicProcedure, router } from "@/lib/trpc/trpc";
import mime from "mime";

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
        const match = firstEntry?.match(/^([^/]+)\//);
        return match ? match[1] : null;
      })();

      await Promise.all(
        Object.entries(zip.files).map(async ([filename, file]) => {
          // Strip the top-level folder name if present
          const cleanName =
            topLevelPrefix && filename.startsWith(`${topLevelPrefix}/`)
              ? filename.slice(topLevelPrefix.length + 1)
              : filename;

          // Skip empty paths or explicit directory markers
          if (!cleanName || cleanName.endsWith("/")) return;

          // Build destination path and normalize for safety
          const destPath = path.join(extractDir, cleanName);
          const safePath = path.normalize(destPath);

          // Prevent zip-slip (ensure inside extractDir)
          if (!safePath.startsWith(extractDir + path.sep)) {
            logger.warn({ msg: "Skipping unsafe path", cleanName });
            return;
          }

          if (file.dir) {
            // Create directory on disk but DO NOT add to DB
            await fs.mkdir(safePath, { recursive: true });
            return;
          }

          // Ensure parent directory exists
          await fs.mkdir(path.dirname(safePath), { recursive: true });

          // Write the file to disk
          const content = await file.async("nodebuffer");
          await fs.writeFile(safePath, content);

          const extension = path.extname(cleanName).slice(1); // remove leading dot
          const mimeType = mime.getType(extension);

          // Only push real files to DB
          newFiles.push({
            filePath: cleanName,
            projectId,
            serverPath: safePath,
            mimeType: mimeType,
          });
        }),
      );

      if (newFiles.length > 0) {
        await db.insert(filesTable).values(newFiles).onConflictDoNothing();
      }

      return { id, filePath, filesSaved: newFiles.length };
    }),
});
