"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import { gbp } from "@/lib/money";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  name: string | null;
  city: string | null;
  sport: string | null;
  ratingAvg: number;
  ratingCount: number;
  rateMinor: number | null;
  verified: boolean;
  lat: number;
  lng: number;
};

// Fix Leaflet's default icon path issue with webpack/turbopack.
function useLeafletIconFix() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    // @ts-expect-error _getIconUrl is internal
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
}

export function CoachMap({ pins, center }: { pins: MapPin[]; center: [number, number] }) {
  useLeafletIconFix();

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "100%", width: "100%", background: "#111" }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <CircleMarker
          key={pin.id}
          center={[pin.lat, pin.lng]}
          radius={12}
          pathOptions={{
            fillColor: "#ccff00",
            fillOpacity: 0.9,
            color: "#000",
            weight: 1.5,
          }}
        >
          <Popup className="coach-map-popup" maxWidth={240}>
            <div className="bg-[#111] text-white rounded-xl p-3 -mx-3 -my-2 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">{pin.name ?? "Coach"}</span>
                {pin.verified && <BadgeCheck className="w-4 h-4 text-[#ccff00]" />}
              </div>
              <p className="text-[#ccff00] text-xs font-medium">{pin.sport ?? "Multi-sport"}</p>
              <p className="text-white/60 text-xs mt-0.5">{pin.city ?? "Remote"}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Star className="w-3.5 h-3.5 text-[#ccff00] fill-[#ccff00]" />
                <span className="text-white text-xs font-semibold">{pin.ratingAvg.toFixed(1)}</span>
                <span className="text-white/50 text-xs">({pin.ratingCount})</span>
                <span className="ml-auto text-white font-bold text-xs">{gbp(pin.rateMinor, { perHour: true })}</span>
              </div>
              <Link
                href={`/coach/${pin.id}`}
                className="mt-2.5 block text-center bg-[#ccff00] text-black font-bold text-xs py-1.5 rounded-lg hover:brightness-110 transition-all"
              >
                View profile
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
