import { db, schema } from "@/server/db";

const DEFAULT_PLANS: Array<{
  key: string;
  label: string;
  durationDays: number;
  priceMinor: number;
  sortOrder: number;
}> = [
  { key: "weekly", label: "Weekly boost", durationDays: 7, priceMinor: 1500, sortOrder: 0 },
  { key: "monthly", label: "Monthly spotlight", durationDays: 30, priceMinor: 4500, sortOrder: 1 },
  { key: "yearly", label: "Year-round featured", durationDays: 365, priceMinor: 39900, sortOrder: 2 },
];

async function main() {
  console.log("Seeding default platform settings…");
  await db
    .insert(schema.platformSettings)
    .values({ id: 1 })
    .onConflictDoNothing();

  console.log("Seeding default featured plans…");
  for (const plan of DEFAULT_PLANS) {
    await db
      .insert(schema.featuredPlans)
      .values(plan)
      .onConflictDoNothing({ target: schema.featuredPlans.key });
  }

  console.log("✓ Platform defaults seeded");
  process.exit(0);
}

main().catch((err) => {
  console.error("Platform defaults seed failed:", err);
  process.exit(1);
});
