"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ *
 *  Shared easing + variant presets (the platform's motion language)
 * ------------------------------------------------------------------ */
const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Reveal children on scroll into view, with stagger. */
export function Reveal({
  children,
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its direct children into view. */
export function RevealGroup({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}

/** Magnetic / lift-on-hover wrapper for interactive cards. */
export function HoverLift({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={reduce ? undefined : { y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { motion };
