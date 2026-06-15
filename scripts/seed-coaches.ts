import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/server/db";

type Demo = {
  name: string;
  email: string;
  sportSlug: string;
  city: string;
  lat: number;
  lng: number;
  rateGBP: number;
  level: "beginner_friendly" | "intermediate" | "advanced" | "elite";
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  experienceYears: number;
  headline: string;
  image: string;
  sessionTypes: string[];
};

const COACHES: Demo[] = [
  { name: "Marcus Chen", email: "marcus@coachconnect.demo", sportSlug: "tennis", city: "London", lat: 51.5074, lng: -0.1278, rateGBP: 85, level: "elite", verified: true, ratingAvg: 4.9, ratingCount: 124, experienceYears: 12, headline: "LTA Level 4 · Tour experience", image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Technique Drill", "Match Practice", "Assessment"] },
  { name: "Sarah Jenkins", email: "sarah@coachconnect.demo", sportSlug: "personal-training", city: "Manchester", lat: 53.4808, lng: -2.2426, rateGBP: 60, level: "beginner_friendly", verified: true, ratingAvg: 5.0, ratingCount: 89, experienceYears: 8, headline: "Strength & nutrition certified", image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Fitness", "Assessment"] },
  { name: "David Okafor", email: "david@coachconnect.demo", sportSlug: "boxing", city: "Birmingham", lat: 52.4862, lng: -1.8904, rateGBP: 75, level: "advanced", verified: true, ratingAvg: 4.8, ratingCount: 210, experienceYears: 15, headline: "Ex-pro · technique focus", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Technique Drill", "Fitness"] },
  { name: "Elena Rostova", email: "elena@coachconnect.demo", sportSlug: "yoga-pilates", city: "London", lat: 51.5104, lng: -0.1000, rateGBP: 50, level: "beginner_friendly", verified: false, ratingAvg: 4.9, ratingCount: 340, experienceYears: 10, headline: "Ashtanga · mindfulness", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Beginner Lesson", "Fitness"] },
  { name: "James Wright", email: "james@coachconnect.demo", sportSlug: "swimming", city: "London", lat: 51.5200, lng: -0.1400, rateGBP: 65, level: "intermediate", verified: true, ratingAvg: 4.7, ratingCount: 56, experienceYears: 7, headline: "Triathlon prep · video analysis", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Assessment", "Technique Drill"] },
  { name: "Anita Patel", email: "anita@coachconnect.demo", sportSlug: "football", city: "Leeds", lat: 53.8008, lng: -1.5491, rateGBP: 55, level: "advanced", verified: true, ratingAvg: 4.9, ratingCount: 178, experienceYears: 9, headline: "UEFA B licence · 1-on-1 drills", image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Technique Drill", "Match Practice"] },
  { name: "Tom Hughes", email: "tom@coachconnect.demo", sportSlug: "golf", city: "Bristol", lat: 51.4545, lng: -2.5879, rateGBP: 70, level: "advanced", verified: false, ratingAvg: 4.6, ratingCount: 40, experienceYears: 11, headline: "PGA pro · short-game specialist", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Beginner Lesson", "Assessment"] },
  { name: "Priya Shah", email: "priya@coachconnect.demo", sportSlug: "athletics", city: "Glasgow", lat: 55.8642, lng: -4.2518, rateGBP: 45, level: "elite", verified: true, ratingAvg: 4.8, ratingCount: 95, experienceYears: 13, headline: "Sprint & conditioning coach", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80", sessionTypes: ["Fitness", "Technique Drill"] },
];

function atHour(daysFromNow: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const password = await bcrypt.hash("Password1", 10);
  let created = 0;

  for (const c of COACHES) {
    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, c.email))
      .limit(1);
    if (existing.length) continue;

    const [sport] = await db
      .select({ id: schema.sports.id })
      .from(schema.sports)
      .where(eq(schema.sports.slug, c.sportSlug))
      .limit(1);

    const [user] = await db
      .insert(schema.users)
      .values({
        name: c.name,
        email: c.email,
        passwordHash: password,
        role: "coach",
        image: c.image,
        locationCity: c.city,
        lat: c.lat,
        lng: c.lng,
      })
      .returning({ id: schema.users.id });

    const [profile] = await db
      .insert(schema.coachProfiles)
      .values({
        userId: user.id,
        headline: c.headline,
        bio: `${c.name} is a ${c.level.replace(/_/g, "-")} coach based in ${c.city}.`,
        experienceYears: c.experienceYears,
        experienceLevel: c.level,
        defaultRateMinor: c.rateGBP * 100,
        status: "active",
        visibility: "public",
        verificationStatus: c.verified ? "verified" : "unverified",
        completeness: 100,
        ratingAvg: c.ratingAvg,
        ratingCount: c.ratingCount,
      })
      .returning({ id: schema.coachProfiles.id });

    if (sport) {
      await db.insert(schema.coachSports).values({ coachId: profile.id, sportId: sport.id });
    }

    const [venue] = await db
      .insert(schema.venues)
      .values({ coachId: profile.id, name: `${c.city} Training Ground`, city: c.city, lat: c.lat, lng: c.lng })
      .returning({ id: schema.venues.id });

    // Create upcoming bookable slots over the next two weeks.
    let st = 0;
    for (let day = 1; day <= 12; day += 2) {
      for (const hour of [10, 17]) {
        await db.insert(schema.slots).values({
          coachId: profile.id,
          venueId: venue.id,
          sportId: sport?.id,
          startAt: atHour(day, hour),
          durationMin: 60,
          sessionType: c.sessionTypes[st % c.sessionTypes.length],
          feeMinor: c.rateGBP * 100,
          status: "open",
        });
        st++;
      }
    }
    created++;
    console.log(`  ✓ ${c.name} (${c.sportSlug})`);
  }

  const total = await db.select().from(schema.coachProfiles);
  console.log(`Seeded ${created} new coaches. Total coach profiles: ${total.length}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
