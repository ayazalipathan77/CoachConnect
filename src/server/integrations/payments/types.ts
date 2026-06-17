/**
 * Payment provider port (BRD §6.4.2, §8.1, §8.2).
 *
 * Models a marketplace escrow flow: client pays at booking, funds are held,
 * released to the coach after session completion, and refunded per the
 * cancellation policy. Implementations: Stripe (real) and an in-memory mock.
 */
export interface CreatePaymentInput {
  bookingId: string;
  amountMinor: number;
  currency: string;
  /** Platform commission portion, for application_fee on Stripe Connect. */
  serviceFeeMinor: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: "requires_payment" | "succeeded" | "processing";
}

export interface RefundResult {
  refundId: string;
  amountMinor: number;
  status: "succeeded" | "pending";
}

export interface PaymentProvider {
  readonly name: string;
  /** Create a held (escrow) payment intent for a booking. */
  createBookingPayment(input: CreatePaymentInput): Promise<PaymentIntentResult>;
  /** Capture/confirm — used by the mock to simulate a completed checkout. */
  confirmPayment(paymentIntentId: string): Promise<PaymentIntentResult>;
  /** Release escrowed funds to the coach after session completion. */
  releaseToCoach(paymentIntentId: string): Promise<void>;
  /** Refund all or part of a payment per cancellation policy. */
  refund(paymentIntentId: string, amountMinor: number): Promise<RefundResult>;
  /**
   * Direct, immediately-captured charge with no escrow step — used for
   * one-off platform purchases like a coach's featured-placement promotion.
   */
  charge(
    amountMinor: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<PaymentIntentResult>;
}
