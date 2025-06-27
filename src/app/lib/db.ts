import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_NAME ||
  !process.env.DB_USER ||
  !process.env.DB_PASS
) {
  throw new Error("Missing database environment variables");
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: false,
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    debug: true,
  });
if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn);
