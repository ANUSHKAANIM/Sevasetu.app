"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { PaymentService } from "@/services/payment-service";

export async function confirmPaymentAction(paymentId: string) {
  const { householdId } = await requireHouseholdContext();

  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { helper: { include: { user: true } } },
  });
  if (payment.householdId !== householdId) {
    throw new Error("This payment does not belong to your household.");
  }
  if (payment.status === "PAID") return;

  const updated = await PaymentService.confirmPayment(paymentId);

  if (updated.status === "PAID") {
    await prisma.notification.create({
      data: {
        userId: payment.helper.userId,
        type: "PAYMENT_COMPLETED",
        title: "Payment received",
        message: `A payment of ₹${Number(payment.totalAmount).toLocaleString("en-IN")} has been marked paid.`,
        link: "/helper/money",
      },
    });
  }

  revalidatePath("/household/payments");
  revalidatePath("/helper/money");
}
