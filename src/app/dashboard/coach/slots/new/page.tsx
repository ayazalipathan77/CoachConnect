import { eq } from "drizzle-orm";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { getCoachVenues } from "@/server/repositories/slots";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SlotForm } from "@/components/coach/SlotForm";

export default async function NewSlotPage() {
  const user = await requireRole("coach");

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

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex items-center gap-3">
        <Link href="/dashboard/coach/slots" className="text-white/40 hover:text-white transition-colors text-sm">
          ← My slots
        </Link>
      </div>

      <div className="max-w-2xl">
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
          <SlotForm venues={venueOpts} sports={sportOpts} />
        </div>
      </div>
    </DashboardShell>
  );
}
