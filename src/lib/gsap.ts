"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single GSAP registration point. Import { gsap, ScrollTrigger } from here so
 * the plugin is only registered once across the client bundle.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
