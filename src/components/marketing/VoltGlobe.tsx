"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { useReducedMotion } from "framer-motion";

/** cobe's runtime supports onRender; the bundled v2 types omit it. */
type GlobeOptions = COBEOptions & {
  onRender: (state: Record<string, number>) => void;
};

/**
 * GPU WebGL globe (cobe, ~2KB) lit in volt, auto-rotating with glowing markers
 * over UK cities — the hero's 3D centerpiece: "elite coaches, everywhere near
 * you." Drag to spin; respects reduced-motion (renders a static frame).
 */
const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [51.5074, -0.1278], size: 0.1 }, // London
  { location: [53.4808, -2.2426], size: 0.07 }, // Manchester
  { location: [52.4862, -1.8904], size: 0.06 }, // Birmingham
  { location: [55.8642, -4.2518], size: 0.06 }, // Glasgow
  { location: [53.8008, -1.5491], size: 0.05 }, // Leeds
  { location: [51.4545, -2.5879], size: 0.05 }, // Bristol
  { location: [55.9533, -3.1883], size: 0.05 }, // Edinburgh
  { location: [53.4084, -2.9916], size: 0.05 }, // Liverpool
];

export function VoltGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const pointer = useRef({ down: false, x: 0, delta: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let phi = 4.2;
    let width = 0;
    const onResize = () => (width = canvas.offsetWidth);
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 17000,
      mapBrightness: 5,
      baseColor: [0.18, 0.2, 0.13],
      markerColor: [0.8, 1, 0.0],
      glowColor: [0.55, 0.7, 0.05],
      markers: MARKERS,
      onRender: (state: Record<string, number>) => {
        if (!reduce && !pointer.current.down) phi += 0.0035;
        state.phi = phi + pointer.current.delta;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as GlobeOptions);

    requestAnimationFrame(() => {
      if (canvas) canvas.style.opacity = "1";
    });
    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        pointer.current.down = true;
        pointer.current.x = e.clientX;
        (e.target as HTMLElement).style.cursor = "grabbing";
      }}
      onPointerUp={(e) => {
        pointer.current.down = false;
        (e.target as HTMLElement).style.cursor = "grab";
      }}
      onPointerMove={(e) => {
        if (pointer.current.down) {
          const d = e.clientX - pointer.current.x;
          pointer.current.delta = d * 0.005;
        }
      }}
      className={className}
      style={{
        width: "100%",
        aspectRatio: "1",
        cursor: "grab",
        contain: "layout paint size",
        opacity: 0,
        transition: "opacity 1s ease",
      }}
    />
  );
}
