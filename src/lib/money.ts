/** Format a minor-unit amount (pence) as a GBP string. */
export function gbp(minor: number | null | undefined, opts: { perHour?: boolean } = {}) {
  if (minor == null) return "—";
  const v = (minor / 100).toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  });
  return opts.perHour ? `${v}/hr` : v;
}
