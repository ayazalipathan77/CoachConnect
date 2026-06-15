import { z } from "zod";

/**
 * Centralized, validated runtime configuration.
 *
 * Every environment variable the platform reads passes through here so that:
 *  - a misconfigured deploy fails fast with a clear message, and
 *  - feature code never touches `process.env` directly.
 *
 * Integration "mode" flags let each external service be `real` or `mock`,
 * which is what makes the integration adapter layer swappable without code
 * changes (see src/server/integrations/*).
 */

const integrationMode = z.enum(["real", "mock"]).default("mock");

const schema = z.object({
  DATABASE_URL: z.string().url(),

  AUTH_SECRET: z.string().min(1).default("dev-insecure-secret-change-me"),
  AUTH_TRUST_HOST: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_APPLE_ID: z.string().optional(),
  AUTH_APPLE_SECRET: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  INTEGRATION_EMAIL: integrationMode,
  INTEGRATION_PUSH: integrationMode,
  INTEGRATION_MAPS: integrationMode,
  INTEGRATION_PAYMENTS: integrationMode,

  // Platform business rules (BRD §8) — configurable without redeploy intent.
  PLATFORM_COMMISSION_RATE: z.coerce.number().min(0).max(1).default(0.15),
  PLATFORM_MIN_FEE_MINOR: z.coerce.number().int().default(500), // £5.00
  PLATFORM_CURRENCY: z.string().default("GBP"),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const config = load();
export type AppConfig = typeof config;
