import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@coachconnect.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "AdminPass1!";
const ADMIN_NAME = "Platform Admin";

async function main() {
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.insert(schema.users).values({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash: hash,
    role: "admin",
    emailVerified: new Date(),
  });

  console.log(`✓ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error("Admin seed failed:", err);
  process.exit(1);
});
