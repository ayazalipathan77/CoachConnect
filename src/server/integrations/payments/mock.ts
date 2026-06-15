import { createId } from "@/lib/id";
import type {
  CreatePaymentInput,
  PaymentIntentResult,
  PaymentProvider,
  RefundResult,
} from "./types";

/**
 * In-memory payment provider for local development and tests.
 * Simulates the escrow lifecycle without contacting Stripe.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  private intents = new Map<
    string,
    { amountMinor: number; released: boolean; refundedMinor: number }
  >();

  async createBookingPayment(
    input: CreatePaymentInput,
  ): Promise<PaymentIntentResult> {
    const paymentIntentId = createId("pi");
    this.intents.set(paymentIntentId, {
      amountMinor: input.amountMinor,
      released: false,
      refundedMinor: 0,
    });
    return {
      paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_mock`,
      status: "requires_payment",
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntentResult> {
    return {
      paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_mock`,
      status: "succeeded",
    };
  }

  async releaseToCoach(paymentIntentId: string): Promise<void> {
    const intent = this.intents.get(paymentIntentId);
    if (intent) intent.released = true;
  }

  async refund(
    paymentIntentId: string,
    amountMinor: number,
  ): Promise<RefundResult> {
    const intent = this.intents.get(paymentIntentId);
    if (intent) intent.refundedMinor += amountMinor;
    return {
      refundId: createId("re"),
      amountMinor,
      status: "succeeded",
    };
  }
}
