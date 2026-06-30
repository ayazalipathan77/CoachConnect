import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { DiscoverControls } from "@/components/discover/DiscoverControls";
import { CoachGridCard } from "@/components/discover/CoachGridCard";
import { MapView } from "@/components/discover/MapView";
import { listCoaches, COACHES_PAGE_SIZE, type CoachSort } from "@/server/repositories/coaches";
import { createMapsProvider, distanceMiles } from "@/server/integrations/maps";
import { db, schema } from "@/server/db";
import type { MapPin } from "@/components/discover/CoachMap";

export const metadata: Metadata = {
  title: "Discover Coaches — CoachConnect",
};

// UK centroid — default map centre when no `near` filter is set.
const UK_CENTER: [number, number] = [54.0, -2.5];

/** Build a discover URL preserving current filters, setting the page number. */
function buildPageHref(
  sp: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k !== "page" && v) params.set(k, v);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/discover?${qs}` : "/discover";
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sport?: string; sort?: string; view?: string; near?: string; maxPrice?: string; minRating?: string; level?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const isMapView = sp.view === "map";

  const maps = createMapsProvider();

  const maxRateMinor = sp.maxPrice ? Math.round(parseFloat(sp.maxPrice) * 100) : undefined;
  const minRating = sp.minRating ? parseFloat(sp.minRating) : undefined;

  // Grid view paginates; map view shows a larger (but still bounded) set of pins.
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const MAP_LIMIT = 200;
  const limit = isMapView ? MAP_LIMIT : COACHES_PAGE_SIZE;
  const offset = isMapView ? 0 : (page - 1) * COACHES_PAGE_SIZE;

  // Geocoding `near` doesn't feed into listCoaches (proximity filtering
  // happens client-side below on the already-fetched list), so run it
  // alongside the coach/sports queries instead of blocking them.
  const [nearGeo, coaches, sports] = await Promise.all([
    sp.near ? maps.geocode(sp.near) : Promise.resolve(null),
    listCoaches({
      q: sp.q,
      sportSlug: sp.sport,
      sort: sp.sort as CoachSort,
      maxRateMinor,
      minRating,
      experienceLevel: sp.level,
      limit,
      offset,
    }),
    db
      .select({ name: schema.sports.name, slug: schema.sports.slug })
      .from(schema.sports)
      .where(eq(schema.sports.active, true)),
  ]);

  // For map view: enrich coaches with coordinates (geocode city if lat/lng missing).
  let mapPins: MapPin[] = [];
  const mapCenter: [number, number] = nearGeo ? [nearGeo.lat, nearGeo.lng] : UK_CENTER;

  if (isMapView) {
    // Geocode each distinct city once — many coaches share a city, so without
    // this we'd fire one (cost-incurring, rate-limited) geocode call per coach.
    const cityGeoCache = new Map<string, { lat: number; lng: number } | null>();
    const enriched = await Promise.all(
      coaches.map(async (c) => {
        let lat = c.lat;
        let lng = c.lng;
        if ((lat === null || lng === null) && c.city) {
          if (!cityGeoCache.has(c.city)) {
            cityGeoCache.set(c.city, await maps.geocode(c.city));
          }
          const geo = cityGeoCache.get(c.city);
          if (geo) { lat = geo.lat; lng = geo.lng; }
        }
        return { ...c, lat, lng };
      }),
    );

    // Filter by proximity when a `near` geocode succeeded (25 mile default radius).
    const radius = 25;
    mapPins = enriched
      .filter((c): c is typeof c & { lat: number; lng: number } => c.lat !== null && c.lng !== null)
      .filter((c) =>
        nearGeo ? distanceMiles(nearGeo, { lat: c.lat, lng: c.lng }) <= radius : true,
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        city: c.city,
        sport: c.sport,
        ratingAvg: c.ratingAvg,
        ratingCount: c.ratingCount,
        rateMinor: c.rateMinor,
        verified: c.verified,
        lat: c.lat,
        lng: c.lng,
      }));
  }

  const displayCoaches = nearGeo && !isMapView
    ? coaches.filter((c) =>
        c.lat !== null && c.lng !== null
          ? distanceMiles(nearGeo, { lat: c.lat!, lng: c.lng! }) <= 25
          : true,
      )
    : coaches;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <main className="px-6 lg:px-12 pt-32 pb-24">
        <div className="mb-10">
          <h1 className="font-display font-bold text-5xl md:text-6xl tracking-tighter">
            Discover <span className="text-brand">Coaches</span>
          </h1>
          <p className="text-white/60 mt-3 text-lg max-w-2xl">
            {isMapView ? mapPins.length : displayCoaches.length} verified coach
            {(isMapView ? mapPins.length : displayCoaches.length) === 1 ? "" : "es"} ready to
            help you progress.{" "}
            {nearGeo && (
              <span className="text-brand">
                Showing results near {nearGeo.formattedAddress}.
              </span>
            )}
          </p>
        </div>

        <DiscoverControls
          sports={sports.filter((s) => s.name !== "Other")}
          q={sp.q}
          sport={sp.sport}
          sort={sp.sort ?? "relevance"}
          view={sp.view ?? "grid"}
          near={sp.near}
          maxPrice={sp.maxPrice}
          minRating={sp.minRating}
          level={sp.level}
        />

        {isMapView ? (
          <MapView pins={mapPins} center={mapCenter} />
        ) : displayCoaches.length === 0 ? (
          <div className="text-center py-24 text-white/40">
            No coaches match your search. Try clearing filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
              {displayCoaches.map((c) => (
                <CoachGridCard key={c.id} coach={c} />
              ))}
            </div>
            {(page > 1 || coaches.length === COACHES_PAGE_SIZE) && (
              <div className="flex items-center justify-center gap-4 mt-12">
                {page > 1 && (
                  <a
                    href={buildPageHref(sp, page - 1)}
                    className="px-5 py-2.5 rounded-lg border border-white/15 text-white/80 hover:bg-white/5 transition-colors"
                  >
                    ← Previous
                  </a>
                )}
                <span className="text-white/50 text-sm">Page {page}</span>
                {coaches.length === COACHES_PAGE_SIZE && (
                  <a
                    href={buildPageHref(sp, page + 1)}
                    className="px-5 py-2.5 rounded-lg border border-white/15 text-white/80 hover:bg-white/5 transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
