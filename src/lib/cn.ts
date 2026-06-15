import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditional className merge with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
