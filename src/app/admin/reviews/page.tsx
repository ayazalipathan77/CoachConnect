import { format } from "date-fns";
import { Star, Eye, EyeOff } from "lucide-react";
import { db } from "@/server/db";
import { hideReview, showReview } from "@/server/admin/actions";

export default async function AdminReviewsPage() {
  const rows = await db.execute<{
    id: string;
    rating: number;
    comment: string | null;
    hidden: boolean;
    created_at: string;
    client_name: string | null;
    coach_id: string;
    coach_name: string | null;
  }>(
    `SELECT r.id, r.rating, r.comment, r.hidden, r.created_at,
            cu.name AS client_name,
            cp.id   AS coach_id,
            cou.name AS coach_name
     FROM reviews r
     JOIN client_profiles cl  ON cl.id  = r.client_id
     JOIN users cu             ON cu.id  = cl.user_id
     JOIN coach_profiles cp    ON cp.id  = r.coach_id
     JOIN users cou            ON cou.id = cp.user_id
     ORDER BY r.created_at DESC`,
  );

  return (
    <div>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Reviews</h1>
      <p className="text-white/40 text-sm mb-8">{rows.length} total</p>

      {rows.length === 0 ? (
        <p className="text-white/40">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.id} className={`bg-[#111111] border rounded-2xl px-6 py-4 ${r.hidden ? "border-red-500/20 opacity-60" : "border-white/10"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-brand text-brand" : "text-white/20"}`} />
                    ))}
                    <span className="text-xs text-white/40">{format(new Date(r.created_at), "d MMM yyyy")}</span>
                    {r.hidden && (
                      <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    <span className="font-medium text-white">{r.client_name ?? "Anonymous"}</span>
                    {" → "}
                    <a href={`/coach/${r.coach_id}`} className="text-brand hover:underline">{r.coach_name ?? "Coach"}</a>
                  </p>
                  {r.comment && <p className="text-sm text-white/50 mt-1 leading-relaxed">{r.comment}</p>}
                </div>
                <form action={r.hidden ? showReview : hideReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors">
                    {r.hidden
                      ? <><Eye className="w-3.5 h-3.5" /> Show</>
                      : <><EyeOff className="w-3.5 h-3.5" /> Hide</>}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
