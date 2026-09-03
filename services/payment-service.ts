import "server-only";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus } from "@prisma/client";

export interface PaymentChargeResult {
  status: Extract<PaymentStatus, "PAID" | "FAILED">;
  providerRef: string;
}

/**
 * Abstraction over a payment gateway. SevaSetu mediates payments rather
 * than letting money change hands directly between household and helper,
 * so every real integration (Razorpay, UPI, banking) can be dropped in
 * behind this interface without touching the rest of the app.
 */
export interface PaymentProvider {
  charge(paymentId: string, amountInRupees: number): Promise<PaymentChargeResult>;
}

/**
 * DEMO / INTEGRATION PENDING — this does not move real money. It simulates
 * a gateway confirming a charge so the payment workflow (statuses, history,
 * dashboards) can be exercised end-to-end in the MVP. See
 * docs/LEGAL_AND_COMPLIANCE.md before connecting a real provider.
 */
export class MockPaymentProvider implements PaymentProvider {
  async charge(paymentId: string): Promise<PaymentChargeResult> {
    // Deterministic "almost always succeeds" simulation, not randomized
    // per-run flakiness that would make demos confusing.
    const providerRef = `MOCK-${paymentId.slice(-8).toUpperCase()}-${Date.now()}`;
    return { status: "PAID", providerRef };
  }
}

export class PaymentService {
  static provider: PaymentProvider = new MockPaymentProvider();

  /** Household confirms a pending payment. Demo/mock — see MockPaymentProvider. */
  static async confirmPayment(paymentId: string) {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PROCESSING" },
    });

    const result = await this.provider.charge(paymentId, Number(payment.totalAmount));

    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: result.status,
        providerRef: result.providerRef,
        paidAt: result.status === "PAID" ? new Date() : null,
      },
    });
  }
}
