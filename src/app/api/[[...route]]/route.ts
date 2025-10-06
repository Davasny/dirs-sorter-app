import { createHash } from "node:crypto";
import { trpcServer } from "@hono/trpc-server";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import JSZip from "jszip";
import path from "path";
import { z } from "zod";
import { filesGroupsTable } from "@/features/files-groups/db";
import { filesTable } from "@/features/project-files/db";
import { projectsTable } from "@/features/projects/db";
import { db } from "@/lib/db/client";
import { uuidToTimestamp } from "@/lib/extractTimestampFromUUIDv7";
import { logger } from "@/lib/logger";
import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/trpc";

export const runtime = "nodejs";

const app = new Hono();

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext: createContext(),
  }),
);

app.get("/api/files/:fileId", async (c) => {
  const { fileId } = c.req.param();

  // Fetch file path from DB
  const [file] = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.id, fileId))
    .limit(1);

  if (!file) {
    return c.json({ msg: "File not found" }, 404);
  }

  try {
    const fileBuffer = await fs.readFile(file.serverPath);
    const mimeType = file.mimeType || "application/octet-stream";
    const fileName = path.basename(file.serverPath);

    // Compute an ETag (hash of file)
    const etag = createHash("sha1").update(fileBuffer).digest("hex");

    const maxAge = 60 * 60; // 1 hour in seconds

    // Handle client cache validation
    const ifNoneMatch = c.req.header("if-none-match");
    if (ifNoneMatch === etag) {
      return c.body(null, 304, {
        ETag: etag,
        "Cache-Control": `public, max-age=${maxAge}, immutable`,
      });
    }

    // Send file with caching headers
    return c.body(Buffer.from(fileBuffer), 200, {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": `public, max-age=${maxAge}, immutable`,
      ETag: etag,
      "Last-Modified": uuidToTimestamp(file.id).toUTCString(),
    });
  } catch (err) {
    console.error("Error reading file:", err);
    return c.json({ msg: "Error reading file" }, 500);
  }
});

app.get(
  "/api/grouped-files/:projectId",
  zValidator("param", z.object({ projectId: z.uuidv7() })),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    logger.info({ msg: "Starting grouped file download", projectId });

    try {
      // Fetch all groups for the project
      const groups = await db
        .select()
        .from(filesGroupsTable)
        .where(eq(filesGroupsTable.projectId, projectId));

      // Fetch all files for the project
      const files = await db
        .select()
        .from(filesTable)
        .where(eq(filesTable.projectId, projectId));

      if (files.length === 0) {
        logger.warn({ msg: "No files found for project", projectId });
        return c.json({ error: "No files found for this project" }, 404);
      }

      logger.info({
        msg: "Files and groups fetched",
        groupCount: groups.length,
        fileCount: files.length,
      });

      // Create a new ZIP
      const zip = new JSZip();

      // Create a map of groupId -> group name
      const groupMap = new Map(groups.map((g) => [g.id, g.name]));

      // Organize files by group
      const ungroupedFiles: typeof files = [];
      const groupedFiles = new Map<string, typeof files>();

      for (const file of files) {
        if (file.groupId && groupMap.has(file.groupId)) {
          const groupName = groupMap.get(file.groupId);
          if (groupName) {
            if (!groupedFiles.has(groupName)) {
              groupedFiles.set(groupName, []);
            }
            const fileGroup = groupedFiles.get(groupName);
            if (fileGroup) {
              fileGroup.push(file);
            }
          } else {
            ungroupedFiles.push(file);
          }
        } else {
          ungroupedFiles.push(file);
        }
      }

      // Add grouped files to ZIP
      for (const [groupName, groupFiles] of groupedFiles.entries()) {
        for (const file of groupFiles) {
          try {
            const fileContent = await fs.readFile(file.serverPath);
            // Place files in folders named after their group
            const zipPath = path.join(groupName, file.filePath);
            zip.file(zipPath, fileContent);
            logger.debug({
              msg: "Added file to group",
              group: groupName,
              file: file.filePath,
            });
          } catch (error) {
            logger.error({
              msg: "Failed to read file",
              filePath: file.serverPath,
              error,
            });
          }
        }
      }

      // Add ungrouped files to a separate folder
      if (ungroupedFiles.length > 0) {
        for (const file of ungroupedFiles) {
          try {
            const fileContent = await fs.readFile(file.serverPath);
            const zipPath = path.join("ungrouped", file.filePath);
            zip.file(zipPath, fileContent);

            logger.debug({ msg: "Added ungrouped file", file: file.filePath });
          } catch (error) {
            logger.error({
              msg: "Failed to read ungrouped file",
              filePath: file.serverPath,
              error,
            });
          }
        }
      }

      // Generate the ZIP buffer
      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      logger.info({
        msg: "ZIP generation complete",
        projectId,
        totalFiles: files.length,
        groupedCount: files.length - ungroupedFiles.length,
        ungroupedCount: ungroupedFiles.length,
        zipSize: zipBuffer.length,
      });

      // Return as octet-stream with appropriate headers
      return c.body(Buffer.from(zipBuffer), 200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="pliki-${project.name}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      });
    } catch (error) {
      logger.error({
        msg: "Error generating grouped files zip",
        projectId,
        error,
      });

      return c.json({ error: "Failed to generate zip file" }, 500);
    }
  },
);

export const GET = handle(app);
export const HEAD = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
