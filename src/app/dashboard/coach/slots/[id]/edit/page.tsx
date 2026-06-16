import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { Pencil, ArrowLeft } from "lucide-react";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { getCoachVenues } from "@/server/repositories/slots";
import { CoachShell } from "@/components/coach/CoachShell";
import { SlotEditForm } from "@/components/coach/SlotEditForm";

export default async function EditSlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id: slotId }] = await Promise.all([requireRole("coach"), params]);

  const [profile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  if (!profile) notFound();

  const [slot] = await db
    .select({
      id: schema.slots.id,
      startAt: schema.slots.startAt,
      durationMin: schema.slots.durationMin,
      sessionType: schema.slots.sessionType,
      feeMinor: schema.slots.feeMinor,
      status: schema.slots.status,
      venueId: schema.slots.venueId,
      sportId: schema.slots.sportId,
    })
    .from(schema.slots)
    .where(and(eq(schema.slots.id, slotId), eq(schema.slots.coachId, profile.id)))
    .limit(1);

  if (!slot) notFound();
  if (slot.status !== "open") {
    return (
      <CoachShell user={user}>
        <div className="max-w-xl">
          <h1 className="font-display font-bold text-3xl tracking-tight mb-4">Cannot edit slot</h1>
          <p className="text-white/50">This slot has already been booked or cancelled and cannot be edited.</p>
        </div>
      </CoachShell>
    );
  }

  const [venues, sports] = await Promise.all([
    getCoachVenues(profile.id),
    db.select({ id: schema.sports.id, name: schema.sports.name }).from(schema.sports).orderBy(schema.sports.name),
  ]);

  const venueOpts = venues.map((v) => ({ id: v.id, label: v.city ? `${v.name} · ${v.city}` : v.name }));
  const sportOpts = sports.map((s) => ({ id: s.id, label: s.name }));

  return (
    <CoachShell user={user}>
      <div className="max-w-2xl">
        <Link href="/dashboard/coach/slots" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> My slots
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Pencil className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight">Edit slot</h1>
            <p className="text-white/40 text-sm mt-0.5">Update this open session — changes apply immediately</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-3xl p-8">
          <SlotEditForm
            slotId={slot.id}
            venues={venueOpts}
            sports={sportOpts}
            defaults={{
              date: format(slot.startAt, "yyyy-MM-dd"),
              time: format(slot.startAt, "HH:mm"),
              durationMin: slot.durationMin,
              sessionType: slot.sessionType,
              feeGBP: slot.feeMinor / 100,
              venueId: slot.venueId ?? null,
              sportId: slot.sportId ?? null,
            }}
          />
        </div>
      </div>
    </CoachShell>
  );
}
