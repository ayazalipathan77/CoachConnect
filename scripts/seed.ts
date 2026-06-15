import { db, schema } from "@/server/db";

/** Sports taxonomy from BRD §7.3. */
const TAXONOMY: Array<{ name: string; category: string; icon: string }> = [
  { name: "Football", category: "Team Sports", icon: "football" },
  { name: "Rugby", category: "Team Sports", icon: "rugby" },
  { name: "Basketball", category: "Team Sports", icon: "basketball" },
  { name: "Hockey", category: "Team Sports", icon: "hockey" },
  { name: "Cricket", category: "Team Sports", icon: "cricket" },
  { name: "Tennis", category: "Racket Sports", icon: "tennis" },
  { name: "Badminton", category: "Racket Sports", icon: "badminton" },
  { name: "Squash", category: "Racket Sports", icon: "squash" },
  { name: "Golf", category: "Precision", icon: "golf" },
  { name: "Swimming", category: "Aquatic", icon: "swimming" },
  { name: "Surfing", category: "Aquatic", icon: "surfing" },
  { name: "Athletics", category: "Fitness", icon: "athletics" },
  { name: "Cycling", category: "Fitness", icon: "cycling" },
  { name: "Personal Training", category: "Fitness", icon: "dumbbell" },
  { name: "Boxing", category: "Combat", icon: "boxing" },
  { name: "Martial Arts", category: "Combat", icon: "martial-arts" },
  { name: "Gymnastics", category: "Movement", icon: "gymnastics" },
  { name: "Yoga / Pilates", category: "Movement", icon: "yoga" },
  { name: "Skiing", category: "Outdoor", icon: "skiing" },
  { name: "Other", category: "Other", icon: "sport" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding sports taxonomy…");
  let order = 0;
  for (const sport of TAXONOMY) {
    await db
      .insert(schema.sports)
      .values({
        name: sport.name,
        slug: slugify(sport.name),
        category: sport.category,
        icon: sport.icon,
        sortOrder: order++,
      })
      .onConflictDoNothing({ target: schema.sports.slug });
  }
  const rows = await db.select().from(schema.sports);
  console.log(`✓ Sports in DB: ${rows.length}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
