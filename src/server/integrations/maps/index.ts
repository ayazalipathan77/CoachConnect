import { config } from "@/server/config";

/** Geolocation port (BRD §6.2 — Google Maps geocode + distance). */
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeocodeResult extends GeoPoint {
  formattedAddress: string;
  city?: string;
  postcode?: string;
}

export interface MapsProvider {
  readonly name: string;
  geocode(query: string): Promise<GeocodeResult | null>;
}

/** Haversine distance in miles — provider-independent helper. */
export function distanceMiles(a: GeoPoint, b: GeoPoint): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Deterministic mock geocoder for a handful of UK cities, with a stable
 * pseudo-random fallback so any postcode resolves to a plausible coordinate.
 */
const UK_CITIES: Record<string, GeocodeResult> = {
  london: { lat: 51.5074, lng: -0.1278, formattedAddress: "London, UK", city: "London" },
  manchester: { lat: 53.4808, lng: -2.2426, formattedAddress: "Manchester, UK", city: "Manchester" },
  birmingham: { lat: 52.4862, lng: -1.8904, formattedAddress: "Birmingham, UK", city: "Birmingham" },
  leeds: { lat: 53.8008, lng: -1.5491, formattedAddress: "Leeds, UK", city: "Leeds" },
  glasgow: { lat: 55.8642, lng: -4.2518, formattedAddress: "Glasgow, UK", city: "Glasgow" },
  liverpool: { lat: 53.4084, lng: -2.9916, formattedAddress: "Liverpool, UK", city: "Liverpool" },
  bristol: { lat: 51.4545, lng: -2.5879, formattedAddress: "Bristol, UK", city: "Bristol" },
  edinburgh: { lat: 55.9533, lng: -3.1883, formattedAddress: "Edinburgh, UK", city: "Edinburgh" },
};

class MockMapsProvider implements MapsProvider {
  readonly name = "mock";
  async geocode(query: string): Promise<GeocodeResult | null> {
    const key = query.trim().toLowerCase();
    for (const [city, point] of Object.entries(UK_CITIES)) {
      if (key.includes(city)) return point;
    }
    // Stable fallback around London based on string hash.
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    const jitter = (h % 1000) / 1000;
    return {
      lat: 51.5074 + (jitter - 0.5) * 1.5,
      lng: -0.1278 + (jitter - 0.5) * 1.5,
      formattedAddress: query,
    };
  }
}

export function createMapsProvider(): MapsProvider {
  switch (config.INTEGRATION_MAPS) {
    case "real":
      // return new GoogleMapsProvider(config.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);
      return new MockMapsProvider();
    default:
      return new MockMapsProvider();
  }
}
