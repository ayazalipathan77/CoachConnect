import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { DiscoverControls } from "@/components/discover/DiscoverControls";
import { CoachGridCard } from "@/components/discover/CoachGridCard";
import { listCoaches, type CoachSort } from "@/server/repositories/coaches";
import { db, schema } from "@/server/db";

export const metadata: Metadata = {
  title: "Discover Coaches — CoachConnect",
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const [coaches, sports] = await Promise.all([
    listCoaches({ q: sp.q, sportSlug: sp.sport, sort: sp.sort as CoachSort }),
    db
      .select({ name: schema.sports.name, slug: schema.sports.slug })
      .from(schema.sports)
      .where(eq(schema.sports.active, true)),
  ]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <main className="px-6 lg:px-12 pt-32 pb-24">
        <div className="mb-10">
          <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tighter">
            Discover <span className="text-brand">Coaches</span>
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-2xl">
            {coaches.length} verified coach{coaches.length === 1 ? "" : "es"} ready to
            help you progress. Filter by sport, price and rating.
          </p>
        </div>

        <DiscoverControls
          sports={sports.filter((s) => s.name !== "Other")}
          q={sp.q}
          sport={sp.sport}
          sort={sp.sort ?? "relevance"}
        />

        {coaches.length === 0 ? (
          <div className="text-center py-24 text-white/40">
            No coaches match your search. Try clearing filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {coaches.map((c) => (
              <CoachGridCard key={c.id} coach={c} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
