import Stripe from "stripe";
import { config } from "@/server/config";
import type {
  CreatePaymentInput,
  PaymentIntentResult,
  PaymentProvider,
  RefundResult,
} from "./types";

/**
 * Stripe-backed payment provider (TEST mode).
 *
 * Uses manual capture to model escrow: funds are authorized at booking and
 * captured (released) only after the session completes. Refunds map to the
 * BRD §8.1 cancellation policy.
 */
export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";
  private stripe: Stripe;

  constructor() {
    if (!config.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is required for the Stripe provider");
    }
    this.stripe = new Stripe(config.STRIPE_SECRET_KEY);
  }

  async createBookingPayment(
    input: CreatePaymentInput,
  ): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: input.amountMinor,
      currency: input.currency.toLowerCase(),
      capture_method: "manual", // escrow: authorize now, capture on completion
      receipt_email: input.customerEmail,
      metadata: { bookingId: input.bookingId, ...input.metadata },
      automatic_payment_methods: { enabled: true },
    });
    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret ?? "",
      status: "requires_payment",
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret ?? "",
      status: intent.status === "succeeded" ? "succeeded" : "processing",
    };
  }

  async releaseToCoach(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async refund(
    paymentIntentId: string,
    amountMinor: number,
  ): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountMinor,
    });
    return {
      refundId: refund.id,
      amountMinor: refund.amount,
      status: refund.status === "succeeded" ? "succeeded" : "pending",
    };
  }
}
