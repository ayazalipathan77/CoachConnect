import { cn } from "@/lib/cn";

/**
 * CoachConnect mark — a "momentum bolt": an upward-forward lightning chevron
 * that reads as both energy (volt) and progress/coaching trajectory.
 * Pure SVG so it scales crisply from favicon to billboard.
 */
export function LogoMark({
  className,
  glow = false,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="CoachConnect"
      className={cn("h-8 w-8", className)}
    >
      <defs>
        <linearGradient id="cc-bolt" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6FF4D" />
          <stop offset="1" stopColor="#A8D400" />
        </linearGradient>
        <linearGradient id="cc-plate" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1C1C24" />
          <stop offset="1" stopColor="#0A0A0B" />
        </linearGradient>
        {glow && (
          <filter id="cc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#cc-plate)" stroke="#26262F" strokeWidth="1.5" />
      {/* Momentum bolt: two stacked chevrons forming a forward lightning stride */}
      <path
        d="M26 9 L13 26 H22 L19 39 L35 20 H25 L29 9 Z"
        fill="url(#cc-bolt)"
        filter={glow ? "url(#cc-glow)" : undefined}
      />
    </svg>
  );
}

export function Wordmark({
  className,
  showMark = true,
  glow = false,
}: {
  className?: string;
  showMark?: boolean;
  glow?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <LogoMark glow={glow} className="h-7 w-7" />}
      <span className="font-display text-lg font-bold tracking-tight text-fg">
        Coach
        <span className="text-volt">Connect</span>
      </span>
    </span>
  );
}
