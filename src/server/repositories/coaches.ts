import "server-only";
import { and, eq, or, ilike, desc, asc, gt, gte, lte, SQL } from "drizzle-orm";
import { db, schema } from "@/server/db";

export type CoachSort = "relevance" | "price" | "rating" | "reviews";

export type CoachCard = {
  id: string;
  name: string | null;
  image: string | null;
  city: string | null;
  sport: string | null;
  experienceLevel: string;
  ratingAvg: number;
  ratingCount: number;
  rateMinor: number | null;
  verified: boolean;
  lat: number | null;
  lng: number | null;
};

export async function listCoaches(opts: {
  q?: string;
  sportSlug?: string;
  sort?: CoachSort;
  maxRateMinor?: number;
  minRating?: number;
  experienceLevel?: string;
} = {}): Promise<CoachCard[]> {
  const filters: SQL[] = [
    eq(schema.coachProfiles.status, "active"),
    eq(schema.coachProfiles.visibility, "public"),
  ];
  if (opts.sportSlug) filters.push(eq(schema.sports.slug, opts.sportSlug));
  if (opts.q) {
    const like = `%${opts.q}%`;
    filters.push(
      or(
        ilike(schema.users.name, like),
        ilike(schema.users.locationCity, like),
      )!,
    );
  }
  if (opts.maxRateMinor != null) filters.push(lte(schema.coachProfiles.defaultRateMinor, opts.maxRateMinor));
  if (opts.minRating != null) filters.push(gte(schema.coachProfiles.ratingAvg, opts.minRating));
  if (opts.experienceLevel) {
    const validLevels = ["beginner_friendly", "intermediate", "advanced", "elite"] as const;
    type Level = typeof validLevels[number];
    if ((validLevels as readonly string[]).includes(opts.experienceLevel)) {
      filters.push(eq(schema.coachProfiles.experienceLevel, opts.experienceLevel as Level));
    }
  }

  const orderBy =
    opts.sort === "price"
      ? asc(schema.coachProfiles.defaultRateMinor)
      : opts.sort === "reviews"
        ? desc(schema.coachProfiles.ratingCount)
        : desc(schema.coachProfiles.ratingAvg);

  const rows = await db
    .select({
      id: schema.coachProfiles.id,
      name: schema.users.name,
      image: schema.users.image,
      city: schema.users.locationCity,
      sport: schema.sports.name,
      experienceLevel: schema.coachProfiles.experienceLevel,
      ratingAvg: schema.coachProfiles.ratingAvg,
      ratingCount: schema.coachProfiles.ratingCount,
      rateMinor: schema.coachProfiles.defaultRateMinor,
      verificationStatus: schema.coachProfiles.verificationStatus,
      lat: schema.users.lat,
      lng: schema.users.lng,
    })
    .from(schema.coachProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .leftJoin(
      schema.coachSports,
      eq(schema.coachSports.coachId, schema.coachProfiles.id),
    )
    .leftJoin(schema.sports, eq(schema.sports.id, schema.coachSports.sportId))
    .where(and(...filters))
    .orderBy(orderBy);

  // Dedupe coaches that match on multiple sport rows.
  const seen = new Map<string, CoachCard>();
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.set(r.id, {
      id: r.id,
      name: r.name,
      image: r.image,
      city: r.city,
      sport: r.sport,
      experienceLevel: r.experienceLevel,
      ratingAvg: r.ratingAvg,
      ratingCount: r.ratingCount,
      rateMinor: r.rateMinor,
      verified: r.verificationStatus === "verified",
      lat: r.lat,
      lng: r.lng,
    });
  }
  return [...seen.values()];
}

export async function getCoachById(id: string) {
  const [coach] = await db
    .select({
      id: schema.coachProfiles.id,
      userId: schema.coachProfiles.userId,
      name: schema.users.name,
      image: schema.users.image,
      city: schema.users.locationCity,
      headline: schema.coachProfiles.headline,
      bio: schema.coachProfiles.bio,
      philosophy: schema.coachProfiles.philosophy,
      achievements: schema.coachProfiles.achievements,
      experienceYears: schema.coachProfiles.experienceYears,
      experienceLevel: schema.coachProfiles.experienceLevel,
      rateMinor: schema.coachProfiles.defaultRateMinor,
      ratingAvg: schema.coachProfiles.ratingAvg,
      ratingCount: schema.coachProfiles.ratingCount,
      verificationStatus: schema.coachProfiles.verificationStatus,
    })
    .from(schema.coachProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .where(eq(schema.coachProfiles.id, id))
    .limit(1);
  if (!coach) return null;

  const sports = await db
    .select({ name: schema.sports.name })
    .from(schema.coachSports)
    .innerJoin(schema.sports, eq(schema.sports.id, schema.coachSports.sportId))
    .where(eq(schema.coachSports.coachId, id));

  const slots = await db
    .select({
      id: schema.slots.id,
      startAt: schema.slots.startAt,
      durationMin: schema.slots.durationMin,
      sessionType: schema.slots.sessionType,
      feeMinor: schema.slots.feeMinor,
      venueName: schema.venues.name,
    })
    .from(schema.slots)
    .leftJoin(schema.venues, eq(schema.venues.id, schema.slots.venueId))
    .where(
      and(
        eq(schema.slots.coachId, id),
        eq(schema.slots.status, "open"),
        gt(schema.slots.startAt, new Date()),
      ),
    )
    .orderBy(asc(schema.slots.startAt))
    .limit(12);

  return {
    ...coach,
    verified: coach.verificationStatus === "verified",
    sports: sports.map((s) => s.name),
    slots,
  };
}
