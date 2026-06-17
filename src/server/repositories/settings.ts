import "server-only";
import { db, schema } from "@/server/db";
import { config } from "@/server/config";

export type PlatformSettings = {
  platformCommissionRate: number;
  platformMinFeeMinor: number;
  stripeAccountLabel: string | null;
  supportEmail: string | null;
  payoutInstructions: string | null;
};

/**
 * Resolved platform settings — the admin-configurable `platform_settings`
 * row overrides the env-driven defaults in src/server/config.ts when its
 * fields are set, so existing call sites keep working even before the row
 * exists or before an admin has changed anything.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const [row] = await db.select().from(schema.platformSettings).limit(1);
  return {
    platformCommissionRate: row?.platformCommissionRate ?? config.PLATFORM_COMMISSION_RATE,
    platformMinFeeMinor: row?.platformMinFeeMinor ?? config.PLATFORM_MIN_FEE_MINOR,
    stripeAccountLabel: row?.stripeAccountLabel ?? null,
    supportEmail: row?.supportEmail ?? null,
    payoutInstructions: row?.payoutInstructions ?? null,
  };
}
