import "server-only";
import { and, eq, or, ilike, desc, asc, gt, gte, lte, sql, exists, inArray, SQL } from "drizzle-orm";
import { db, schema } from "@/server/db";

/** Default discover page size — keeps the query and payload bounded. */
export const COACHES_PAGE_SIZE = 24;

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
  featured: boolean;
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
  limit?: number;
  offset?: number;
} = {}): Promise<CoachCard[]> {
  const filters: SQL[] = [
    eq(schema.coachProfiles.status, "active"),
    eq(schema.coachProfiles.visibility, "public"),
  ];
  // Sport filter via EXISTS rather than a join, so a coach who teaches several
  // sports still produces exactly one row (no fan-out, so LIMIT counts coaches).
  if (opts.sportSlug) {
    filters.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(schema.coachSports)
          .innerJoin(schema.sports, eq(schema.sports.id, schema.coachSports.sportId))
          .where(
            and(
              eq(schema.coachSports.coachId, schema.coachProfiles.id),
              eq(schema.sports.slug, opts.sportSlug),
            ),
          ),
      ),
    );
  }
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

  const secondarySort =
    opts.sort === "price"
      ? asc(schema.coachProfiles.defaultRateMinor)
      : opts.sort === "reviews"
        ? desc(schema.coachProfiles.ratingCount)
        : desc(schema.coachProfiles.ratingAvg);

  // Featured coaches first. COALESCE keeps non-featured (NULL featuredUntil) as
  // `false` so DESC doesn't sort NULLs to the top.
  const featuredExpr = sql<boolean>`COALESCE(${schema.coachProfiles.featuredUntil} > now(), false)`;

  const limit = opts.limit ?? COACHES_PAGE_SIZE;
  const offset = opts.offset ?? 0;

  const rows = await db
    .select({
      id: schema.coachProfiles.id,
      name: schema.users.name,
      image: schema.users.image,
      city: schema.users.locationCity,
      experienceLevel: schema.coachProfiles.experienceLevel,
      ratingAvg: schema.coachProfiles.ratingAvg,
      ratingCount: schema.coachProfiles.ratingCount,
      rateMinor: schema.coachProfiles.defaultRateMinor,
      verificationStatus: schema.coachProfiles.verificationStatus,
      featuredUntil: schema.coachProfiles.featuredUntil,
      lat: schema.users.lat,
      lng: schema.users.lng,
    })
    .from(schema.coachProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .where(and(...filters))
    .orderBy(desc(featuredExpr), secondarySort)
    .limit(limit)
    .offset(offset);

  // Attach one sport name per coach for the card, batched in a single query.
  const ids = rows.map((r) => r.id);
  const sportByCoach = new Map<string, string>();
  if (ids.length > 0) {
    const sportRows = await db
      .select({ coachId: schema.coachSports.coachId, name: schema.sports.name })
      .from(schema.coachSports)
      .innerJoin(schema.sports, eq(schema.sports.id, schema.coachSports.sportId))
      .where(inArray(schema.coachSports.coachId, ids));
    for (const s of sportRows) {
      if (!sportByCoach.has(s.coachId)) sportByCoach.set(s.coachId, s.name);
    }
  }

  const now = Date.now();
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    image: r.image,
    city: r.city,
    sport: sportByCoach.get(r.id) ?? null,
    experienceLevel: r.experienceLevel,
    ratingAvg: r.ratingAvg,
    ratingCount: r.ratingCount,
    rateMinor: r.rateMinor,
    verified: r.verificationStatus === "verified",
    featured: !!r.featuredUntil && r.featuredUntil.getTime() > now,
    lat: r.lat,
    lng: r.lng,
  }));
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
      featuredUntil: schema.coachProfiles.featuredUntil,
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
    featured: !!coach.featuredUntil && coach.featuredUntil.getTime() > Date.now(),
    sports: sports.map((s) => s.name),
    slots,
  };
}
