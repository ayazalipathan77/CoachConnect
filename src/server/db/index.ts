import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/server/config";
import * as schema from "./schema";

/**
 * Single shared postgres-js connection pool + Drizzle client.
 *
 * In dev we cache on globalThis so Next.js hot-reload doesn't open a new pool
 * on every module re-evaluation (a classic source of connection exhaustion).
 */
const globalForDb = globalThis as unknown as {
  __ccPool?: ReturnType<typeof postgres>;
};

const isLocal =
  config.DATABASE_URL.includes("localhost") ||
  config.DATABASE_URL.includes("127.0.0.1");

const pool =
  globalForDb.__ccPool ??
  postgres(config.DATABASE_URL, {
    max: 10,
    prepare: false,
    ssl: isLocal ? false : "require",
  });

if (process.env.NODE_ENV !== "production") globalForDb.__ccPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
export type DB = typeof db;
