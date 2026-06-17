import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Star, BadgeCheck, Clock, ArrowRight, ShieldCheck, MessageSquare, FileText } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { getCoachById } from "@/server/repositories/coaches";
import { getCoachReviews } from "@/server/repositories/reviews";
import { getCoachDocuments } from "@/server/repositories/media";
import { getCurrentUser } from "@/server/auth/current-user";
import { startConversation } from "@/server/messaging/actions";
import { gbp } from "@/lib/money";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";

const LEVEL_LABEL: Record<string, string> = {
  beginner_friendly: "Beginner-friendly",
  intermediate: "Intermediate",
  advanced: "Advanced",
  elite: "Elite",
};

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coach, reviews, viewer] = await Promise.all([
    getCoachById(id),
    getCoachReviews(id),
    getCurrentUser(),
  ]);
  if (!coach) notFound();
  const canMessage = viewer?.role === "client";
  const approvedDocs = (await getCoachDocuments(coach.userId)).filter((d) => d.status === "approved");

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <main className="px-6 lg:px-12 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: identity + bio */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border border-white/10 shrink-0">
                {coach.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coach.image} alt={coach.name ?? "Coach"} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">{coach.name}</h1>
                  {coach.verified && (
                    <span className="inline-flex items-center gap-1 text-brand text-sm font-medium border border-brand/30 bg-brand/10 px-2.5 py-1 rounded-full">
                      <BadgeCheck className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-brand font-medium text-lg mt-1">{coach.sports.join(" · ") || "Coach"}</p>
                <p className="text-white/60 mt-1">{coach.headline}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/70">
                  <span className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 fill-brand text-brand" /> {coach.ratingAvg.toFixed(1)} ({coach.ratingCount} reviews)</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {coach.city ?? "Remote"}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {coach.experienceYears} yrs experience</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs">{LEVEL_LABEL[coach.experienceLevel]}</span>
                </div>
              </div>
            </div>

            <section className="mt-10">
              <h2 className="font-display font-bold text-2xl mb-3">About</h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-2xl">{coach.bio}</p>
            </section>

            {coach.achievements && (
              <section className="mt-8">
                <h2 className="font-display font-bold text-xl mb-3">Achievements & qualifications</h2>
                <p className="text-white/60 leading-relaxed max-w-2xl whitespace-pre-line">{coach.achievements}</p>
              </section>
            )}

            {coach.philosophy && (
              <section className="mt-8">
                <h2 className="font-display font-bold text-xl mb-3">Coaching philosophy</h2>
                <p className="text-white/60 leading-relaxed max-w-2xl italic">&quot;{coach.philosophy}&quot;</p>
              </section>
            )}

            {approvedDocs.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand" /> Verified qualifications
                </h2>
                <div className="flex flex-col gap-2 max-w-2xl">
                  {approvedDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 bg-[#111111] border border-white/10 rounded-xl px-4 py-3">
                      <FileText className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="flex-1 text-sm text-white/80">{doc.title}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-brand font-medium bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10 flex items-center gap-3 text-sm text-white/50 bg-[#111111] border border-white/10 rounded-2xl px-5 py-4 max-w-2xl">
              <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
              Payments are held in escrow and only released to the coach after your session completes.
            </section>

            {canMessage && (
              <section className="mt-6 max-w-2xl">
                <form action={startConversation}>
                  <FormPendingLoader />
                  <input type="hidden" name="coachUserId" value={coach.userId} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Message coach
                  </button>
                </form>
              </section>
            )}

            {reviews.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display font-bold text-2xl mb-6">
                  Reviews
                  <span className="text-white/30 font-normal text-lg ml-3">{reviews.length}</span>
                </h2>
                <div className="flex flex-col gap-4 max-w-2xl">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-[#111111] border border-white/10 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-brand text-brand" : "text-white/20"}`} />
                          ))}
                        </div>
                        <span className="text-white/30 text-xs">{format(r.createdAt, "d MMM yyyy")}</span>
                      </div>
                      <p className="font-semibold text-sm">{r.clientName ?? "Anonymous"}</p>
                      {Array.isArray(r.tags) && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(r.tags as string[]).map((tag) => (
                            <span key={tag} className="text-xs bg-brand/10 border border-brand/20 text-brand px-2.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.comment && <p className="text-white/60 text-sm mt-2 leading-relaxed">{r.comment}</p>}
                      {r.coachResponse && (
                        <div className="mt-3 pl-3 border-l-2 border-brand/30 text-sm text-white/50">
                          <span className="font-medium text-brand">Coach reply: </span>{r.coachResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: bookable slots */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-[#111111] border border-white/10 rounded-3xl p-6">
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="font-display font-bold text-xl">Available sessions</h2>
              </div>
              <p className="text-white/50 text-sm mb-5">From {gbp(coach.rateMinor, { perHour: true })}</p>

              {coach.slots.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center">No open sessions right now. Check back soon.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  {coach.slots.map((slot) => (
                    <Link
                      key={slot.id}
                      href={`/book/${slot.id}`}
                      className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-white/10 hover:border-brand/50 transition-colors"
                    >
                      <div>
                        <p className="text-white font-bold text-sm">{format(slot.startAt, "EEE d MMM · HH:mm")}</p>
                        <p className="text-white/50 text-xs mt-0.5">{slot.sessionType} · {slot.durationMin}m</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-brand font-bold">{gbp(slot.feeMinor)}</span>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
