import { createEnv } from "@t3-oss/env-nextjs";
import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

dotenvConfig({
  path: ".env.local",
});

export const config = createEnv({
  server: {
    DB_CONNECTION_STRING: z
      .string()
      .default("postgresql://sorter:sorter@localhost:5436/sorter"),

    UPLOADS_DIR_PATH: z.string().nullable().default(null),
  },

  runtimeEnv: {
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,

    UPLOADS_DIR_PATH: process.env.UPLOADS_DIR_PATH,
  },
});
