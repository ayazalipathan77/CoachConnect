import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { getActiveFeaturedPlans, getCoachFeaturedStatus, getFeaturedPromotionHistory } from "@/server/repositories/featured";
import { CoachShell } from "@/components/coach/CoachShell";
import { FeaturedPlanCard } from "@/components/coach/FeaturedPlanCard";
import { gbp } from "@/lib/money";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

export default async function CoachFeaturedPage() {
  const user = await requireRole("coach");

  const [profile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const [plans, status, history] = await Promise.all([
    getActiveFeaturedPlans(),
    profile ? getCoachFeaturedStatus(profile.id) : Promise.resolve({ featuredUntil: null, isFeatured: false }),
    profile ? getFeaturedPromotionHistory(profile.id) : Promise.resolve([]),
  ]);

  return (
    <CoachShell user={user}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl tracking-tight">Get featured</h1>
        <p className="text-white/40 mt-1 text-sm">Pay to appear at the top of discover and search results for a limited time.</p>
      </div>

      <div className={`mb-8 flex items-center gap-3 rounded-2xl px-5 py-4 border ${status.isFeatured ? "bg-brand/10 border-brand/20 text-brand" : "bg-white/5 border-white/10 text-white/50"}`}>
        <Sparkles className="w-5 h-5 shrink-0" />
        {status.isFeatured && status.featuredUntil ? (
          <p className="text-sm font-medium">You&apos;re currently featured until {format(status.featuredUntil, "d MMM yyyy, HH:mm")}.</p>
        ) : (
          <p className="text-sm">You&apos;re not currently featured. Purchase a plan below to boost your visibility.</p>
        )}
      </div>

      {plans.length === 0 ? (
        <p className="text-white/40 text-sm">No featured plans are available right now — check back later.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {plans.map((plan) => (
            <FeaturedPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="font-bold text-white/60 text-xs uppercase tracking-widest mb-3">Purchase history</h2>
          <div className="flex flex-col gap-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-4 bg-[#111111] border border-white/10 rounded-xl px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{h.planLabel}</p>
                  <p className="text-white/40 text-xs mt-0.5">{format(h.createdAt, "d MMM yyyy")} · {gbp(h.amountMinor)}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/10 text-white/60">
                  {STATUS_LABEL[h.status] ?? h.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </CoachShell>
  );
}
