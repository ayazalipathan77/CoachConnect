"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./CoachMap";

const CoachMap = dynamic(() => import("./CoachMap").then((m) => ({ default: m.CoachMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-[#111] flex items-center justify-center">
      <span className="text-white/40 text-sm">Loading map…</span>
    </div>
  ),
});

export function MapView({ pins, center }: { pins: MapPin[]; center: [number, number] }) {
  return (
    <div className="w-full h-[600px] mt-10">
      <CoachMap pins={pins} center={center} />
    </div>
  );
}
