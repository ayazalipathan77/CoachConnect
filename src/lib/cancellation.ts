/**
 * BRD §8.1 cancellation refund matrix (client-initiated):
 *   ≥ 48 h before session  → full refund  (100%)
 *   24–48 h before session → partial      (50%)
 *   < 24 h before session  → no refund   (0%)
 */
export function refundPercent(sessionStart: Date, cancelledAt: Date = new Date()): number {
  const hoursUntil = (sessionStart.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);
  if (hoursUntil >= 48) return 100;
  if (hoursUntil >= 24) return 50;
  return 0;
}
