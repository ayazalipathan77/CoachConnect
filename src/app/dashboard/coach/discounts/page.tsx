import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { CoachShell } from "@/components/coach/CoachShell";
import { DiscountRulesManager } from "@/components/coach/DiscountRulesManager";

export default async function CoachDiscountsPage() {
  const user = await requireRole("coach");

  const [profile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const [rules, slots] = await Promise.all([
    profile
      ? db
          .select()
          .from(schema.discountRules)
          .where(eq(schema.discountRules.coachId, profile.id))
          .orderBy(desc(schema.discountRules.createdAt))
      : Promise.resolve([]),
    profile
      ? db
          .select({ id: schema.slots.id, startAt: schema.slots.startAt, sessionType: schema.slots.sessionType })
          .from(schema.slots)
          .where(eq(schema.slots.coachId, profile.id))
      : Promise.resolve([]),
  ]);

  const slotOpts = slots.map((s) => ({
    id: s.id,
    label: `${s.sessionType} · ${format(s.startAt, "d MMM HH:mm")}`,
  }));

  return (
    <CoachShell user={user}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl tracking-tight">Discounts</h1>
        <p className="text-white/40 mt-1 text-sm">Automatic discounts applied at booking time — early-bird or a flat % off.</p>
      </div>

      <DiscountRulesManager
        rules={rules.map((r) => ({
          id: r.id,
          label: r.label,
          type: r.type,
          percentOff: r.percentOff,
          minDaysBeforeStart: r.minDaysBeforeStart,
          active: r.active,
          slotId: r.slotId,
        }))}
        slots={slotOpts}
      />
    </CoachShell>
  );
}
