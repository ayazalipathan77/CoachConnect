import { eq } from "drizzle-orm";
import { User } from "lucide-react";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { CoachShell } from "@/components/coach/CoachShell";
import { ProfileForm } from "@/components/coach/ProfileForm";
import { SportsManager } from "@/components/coach/SportsManager";
import { AvatarUpload } from "@/components/coach/AvatarUpload";

export default async function CoachProfilePage() {
  const user = await requireRole("coach");

  const [profile, userData, allSports] = await Promise.all([
    db
      .select({
        id: schema.coachProfiles.id,
        headline: schema.coachProfiles.headline,
        bio: schema.coachProfiles.bio,
        philosophy: schema.coachProfiles.philosophy,
        experienceYears: schema.coachProfiles.experienceYears,
        experienceLevel: schema.coachProfiles.experienceLevel,
        defaultRateMinor: schema.coachProfiles.defaultRateMinor,
        visibility: schema.coachProfiles.visibility,
        completeness: schema.coachProfiles.completeness,
      })
      .from(schema.coachProfiles)
      .where(eq(schema.coachProfiles.userId, user.userId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({ locationCity: schema.users.locationCity, image: schema.users.image })
      .from(schema.users)
      .where(eq(schema.users.id, user.userId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({ id: schema.sports.id, name: schema.sports.name })
      .from(schema.sports)
      .where(eq(schema.sports.active, true))
      .orderBy(schema.sports.name),
  ]);

  const currentSports = profile
    ? await db
        .select({ id: schema.sports.id, name: schema.sports.name })
        .from(schema.coachSports)
        .innerJoin(schema.sports, eq(schema.sports.id, schema.coachSports.sportId))
        .where(eq(schema.coachSports.coachId, profile.id))
    : [];

  const completeness = profile?.completeness ?? 0;

  return (
    <CoachShell user={user}>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <User className="w-5 h-5 text-brand" />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight">My profile</h1>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-brand transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <span className="text-brand text-sm font-bold">{completeness}% complete</span>
        </div>

        <div className="flex flex-col gap-6">
          {/* Photo */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Photo</h3>
            <AvatarUpload currentImage={userData?.image ?? null} />
          </div>

          {/* Profile details */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
            <ProfileForm
              defaultValues={{
                headline: profile?.headline ?? null,
                bio: profile?.bio ?? null,
                philosophy: profile?.philosophy ?? null,
                experienceYears: profile?.experienceYears ?? 0,
                experienceLevel: profile?.experienceLevel ?? "intermediate",
                defaultRateMinor: profile?.defaultRateMinor ?? null,
                visibility: profile?.visibility ?? "public",
                locationCity: userData?.locationCity ?? null,
              }}
            />
          </div>

          {/* Sports */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Sports you coach</h3>
            <SportsManager currentSports={currentSports} allSports={allSports} />
          </div>
        </div>
      </div>
    </CoachShell>
  );
}
