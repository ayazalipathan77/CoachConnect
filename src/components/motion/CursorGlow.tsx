"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Global cursor-reactive spotlight. A soft volt radial follows the pointer
 * with eased lag and screen blend, giving the whole page a "lit-from-within"
 * premium feel. Pure rAF + transform for 60fps; disabled for touch / reduced
 * motion.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 h-[600px] w-[600px] mix-blend-screen will-change-transform"
      style={{
        background:
          "radial-gradient(circle, rgba(204,255,0,0.10) 0%, rgba(204,255,0,0.04) 30%, transparent 60%)",
      }}
    />
  );
}
