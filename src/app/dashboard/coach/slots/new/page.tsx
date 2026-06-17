import { eq } from "drizzle-orm";
import { CalendarPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { getCoachVenues } from "@/server/repositories/slots";
import { CoachShell } from "@/components/coach/CoachShell";
import { SlotForm } from "@/components/coach/SlotForm";

export default async function NewSlotPage({
  searchParams,
}: {
  searchParams: Promise<{
    sessionType?: string;
    durationMin?: string;
    feeGBP?: string;
    maxParticipants?: string;
    venueId?: string;
    sportId?: string;
  }>;
}) {
  const [user, sp] = await Promise.all([requireRole("coach"), searchParams]);

  const [profile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const [venues, sports] = await Promise.all([
    profile ? getCoachVenues(profile.id) : [],
    db.select({ id: schema.sports.id, name: schema.sports.name }).from(schema.sports).orderBy(schema.sports.name),
  ]);

  const venueOpts = venues.map((v) => ({
    id: v.id,
    label: v.city ? `${v.name} · ${v.city}` : v.name,
  }));
  const sportOpts = sports.map((s) => ({ id: s.id, label: s.name }));

  const recreated = !!(sp.sessionType || sp.durationMin || sp.feeGBP);
  const defaults = recreated
    ? {
        sessionType: sp.sessionType,
        durationMin: sp.durationMin ? Number(sp.durationMin) : undefined,
        feeGBP: sp.feeGBP ? Number(sp.feeGBP) : undefined,
        maxParticipants: sp.maxParticipants ? Number(sp.maxParticipants) : undefined,
        venueId: sp.venueId,
        sportId: sp.sportId,
        recreated: true,
      }
    : undefined;

  return (
    <CoachShell user={user}>
      <div className="max-w-2xl">
        <Link href="/dashboard/coach/slots" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> My slots
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <CalendarPlus className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight">Create a slot</h1>
            <p className="text-white/40 text-sm mt-0.5">Add a bookable session for clients to discover</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-3xl p-8">
          <SlotForm venues={venueOpts} sports={sportOpts} defaults={defaults} />
        </div>
      </div>
    </CoachShell>
  );
}
