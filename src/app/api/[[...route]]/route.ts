import { createHash } from "node:crypto";
import { trpcServer } from "@hono/trpc-server";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import path from "path";
import { filesTable } from "@/features/project-files/db";
import { db } from "@/lib/db/client";
import { uuidToTimestamp } from "@/lib/extractTimestampFromUUIDv7";
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

export default app;

export const GET = handle(app);
export const HEAD = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
