import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { octetInputParser } from "@trpc/server/http";
import { logger } from "@/lib/logger";
import { publicProcedure, router } from "@/lib/trpc/trpc";

export const appRouter = router({
  upload: publicProcedure
    .input(octetInputParser)
    .mutation(async ({ input }) => {
      const id = randomUUID();
      const dir = path.join(process.cwd(), "uploads");
      const filePath = path.join(dir, `${id}.zip`);

      await fs.mkdir(dir, { recursive: true });

      const nodeWebStream = input as unknown as NodeReadableStream<Uint8Array>;
      const nodeReadable = Readable.fromWeb(nodeWebStream);
      await pipeline(
        nodeReadable,
        (await import("node:fs")).createWriteStream(filePath),
      );

      logger.info({msg: "File uploaded", id, filePath});

      return { id, filePath };
    }),
});

export type AppRouter = typeof appRouter;
