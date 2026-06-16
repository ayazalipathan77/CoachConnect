import { format } from "date-fns";
import { Star, MessageSquare } from "lucide-react";
import { eq } from "drizzle-orm";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { getCoachReviews } from "@/server/repositories/reviews";
import { CoachShell } from "@/components/coach/CoachShell";
import { ReviewResponseForm } from "@/components/coach/ReviewResponseForm";

export default async function CoachReviewsPage() {
  const user = await requireRole("coach");

  const [profile] = await db
    .select({ id: schema.coachProfiles.id, ratingAvg: schema.coachProfiles.ratingAvg, ratingCount: schema.coachProfiles.ratingCount })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const reviews = profile ? await getCoachReviews(profile.id) : [];

  return (
    <CoachShell user={user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl tracking-tight">Reviews</h1>
          {profile && (
            <p className="text-white/40 mt-1 text-sm">
              {profile.ratingAvg.toFixed(1)} avg · {profile.ratingCount} total
            </p>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-[#111] border border-white/10 rounded-3xl p-12 text-center">
          <Star className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No reviews yet. Complete sessions to receive reviews.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#111] border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-brand text-brand" : "text-white/20"}`} />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{r.clientName ?? "Anonymous"}</p>
                </div>
                <span className="text-white/30 text-xs shrink-0">{format(r.createdAt, "d MMM yyyy")}</span>
              </div>

              {Array.isArray(r.tags) && r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(r.tags as string[]).map((tag) => (
                    <span key={tag} className="text-xs bg-brand/10 border border-brand/20 text-brand px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {r.comment && <p className="text-white/70 text-sm leading-relaxed mb-4">{r.comment}</p>}

              {r.coachResponse ? (
                <div className="pl-4 border-l-2 border-brand/30">
                  <p className="text-xs text-brand font-medium mb-1">Your reply</p>
                  <p className="text-white/60 text-sm">{r.coachResponse}</p>
                </div>
              ) : (
                <ReviewResponseForm reviewId={r.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </CoachShell>
  );
}
