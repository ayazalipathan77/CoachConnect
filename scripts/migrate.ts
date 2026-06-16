import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL is not set");
    process.exit(1);
  }

  const masked = url.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  console.log(`Connecting to: ${masked}`);

  const client = postgres(url, { max: 1, connect_timeout: 30 });
  const db = drizzle(client);

  try {
    console.log("Applying migrations…");
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("✓ Migrations applied successfully");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
