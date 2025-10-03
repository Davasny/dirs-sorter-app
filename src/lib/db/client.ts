import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "@/lib/config/config";

export const db = drizzle(config.DB_CONNECTION_STRING);
