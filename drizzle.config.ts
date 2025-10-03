import { defineConfig } from "drizzle-kit";
import { config } from "@/lib/config/config";

export default defineConfig({
  schema: ["./src/features/auth/db.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: config.DB_CONNECTION_STRING,
  },
});
