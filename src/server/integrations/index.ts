import { createPaymentProvider } from "./payments";
import { createEmailProvider } from "./email";
import { createPushProvider } from "./push";
import { createMapsProvider } from "./maps";
import { createStorageProvider } from "./storage";

/**
 * Integration registry — the single composition root for every external
 * service. Feature code depends on these ports, never on a concrete SDK, so
 * swapping mock ↔ real (via INTEGRATION_* env flags) needs no code changes.
 */
const globalForIntegrations = globalThis as unknown as {
  __ccIntegrations?: ReturnType<typeof build>;
};

function build() {
  return {
    payments: createPaymentProvider(),
    email: createEmailProvider(),
    push: createPushProvider(),
    maps: createMapsProvider(),
    storage: createStorageProvider(),
  };
}

export const integrations =
  globalForIntegrations.__ccIntegrations ?? build();

if (process.env.NODE_ENV !== "production") {
  globalForIntegrations.__ccIntegrations = integrations;
}

export type Integrations = typeof integrations;
