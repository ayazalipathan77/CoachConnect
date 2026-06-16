import { desc, eq } from "drizzle-orm";
import { BadgeCheck, ShieldOff, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { db, schema } from "@/server/db";
import { verifyCoach, rejectCoach, suspendCoach, activateCoach } from "@/server/admin/actions";

const VSTYLE: Record<string, string> = {
  verified: "bg-brand/10 text-brand border-brand/20",
  unverified: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};
const SSTYLE: Record<string, string> = {
  active: "text-green-400",
  pending_review: "text-amber-400",
  paused: "text-white/40",
};

export default async function AdminCoachesPage() {
  const coaches = await db
    .select({
      id: schema.coachProfiles.id,
      status: schema.coachProfiles.status,
      verificationStatus: schema.coachProfiles.verificationStatus,
      completeness: schema.coachProfiles.completeness,
      ratingAvg: schema.coachProfiles.ratingAvg,
      ratingCount: schema.coachProfiles.ratingCount,
      name: schema.users.name,
      email: schema.users.email,
      createdAt: schema.coachProfiles.createdAt,
    })
    .from(schema.coachProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .orderBy(desc(schema.coachProfiles.createdAt));

  return (
    <div>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Coaches</h1>
      <p className="text-white/40 text-sm mb-8">{coaches.length} coach profiles</p>

      <div className="flex flex-col gap-3">
        {coaches.map((c) => (
          <div key={c.id} className="bg-[#111111] border border-white/10 rounded-2xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/coach/${c.id}`} className="font-bold hover:text-brand transition-colors">
                    {c.name ?? "(no name)"}
                  </Link>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${VSTYLE[c.verificationStatus] ?? VSTYLE.unverified}`}>
                    {c.verificationStatus}
                  </span>
                  <span className={`text-xs font-medium ${SSTYLE[c.status] ?? "text-white/40"}`}>
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-1">{c.email} · {c.completeness}% complete · ★ {c.ratingAvg.toFixed(1)} ({c.ratingCount})</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {c.verificationStatus !== "verified" && (
                  <form action={verifyCoach}>
                    <input type="hidden" name="coachId" value={c.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition-colors">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verify
                    </button>
                  </form>
                )}
                {c.verificationStatus === "unverified" && (
                  <form action={rejectCoach}>
                    <input type="hidden" name="coachId" value={c.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
                      <UserX className="w-3.5 h-3.5" /> Reject
                    </button>
                  </form>
                )}
                {c.status === "active" ? (
                  <form action={suspendCoach}>
                    <input type="hidden" name="coachId" value={c.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                      <ShieldOff className="w-3.5 h-3.5" /> Suspend
                    </button>
                  </form>
                ) : c.status === "paused" ? (
                  <form action={activateCoach}>
                    <input type="hidden" name="coachId" value={c.id} />
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                      <UserCheck className="w-3.5 h-3.5" /> Activate
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
