import { config } from "@/server/config";
import { MockPaymentProvider } from "./mock";
import { StripePaymentProvider } from "./stripe";
import type { PaymentProvider } from "./types";

export * from "./types";

export function createPaymentProvider(): PaymentProvider {
  if (config.INTEGRATION_PAYMENTS === "real" && config.STRIPE_SECRET_KEY) {
    return new StripePaymentProvider();
  }
  return new MockPaymentProvider();
}
