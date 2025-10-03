import { createEnv } from "@t3-oss/env-nextjs";
import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

dotenvConfig({
  path: ".env.local",
});

export const config = createEnv({
  server: {
    ENVIRONMENT: z.enum(["PROD", "LOCAL"]).default("LOCAL"),

    DB_CONNECTION_STRING: z
      .string()
      .default("postgresql://sorter:sorter@localhost:5436/sorter"),

  },

  runtimeEnv: {
    ENVIRONMENT: process.env.ENVIRONMENT,

    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  },
});
