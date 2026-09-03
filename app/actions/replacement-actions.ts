"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext, requireAdminContext } from "@/lib/session-helpers";

export interface ReplacementFormState {
  error?: string;
  success?: boolean;
}

const createReplacementSchema = z.object({
  contractId: z.string(),
  type: z.enum(["TEMPORARY", "PERMANENT"]),
  reason: z.string().min(5, "Please describe the reason."),
});

export async function createReplacementRequestAction(
  _prevState: ReplacementFormState,
  formData: FormData
): Promise<ReplacementFormState> {
  const { householdId } = await requireHouseholdContext();

  const parsed = createReplacementSchema.safeParse({
    contractId: formData.get("contractId"),
    type: formData.get("type"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const contract = await prisma.employmentContract.findUnique({
    where: { id: parsed.data.contractId },
  });
  if (!contract || contract.householdId !== householdId) {
    return { error: "Contract not found." };
  }

  await prisma.replacementRequest.create({
    data: {
      contractId: contract.id,
      householdId,
      originalHelperId: contract.helperId,
      type: parsed.data.type,
      reason: parsed.data.reason,
      status: "OPEN",
    },
  });

  revalidatePath("/household/replacement");
  revalidatePath("/admin/replacements");
  return { success: true };
}

export async function updateReplacementStatusAction(
  replacementRequestId: string,
  status: "MATCHING" | "MATCHED" | "CLOSED",
  matchedHelperId?: string
) {
  await requireAdminContext();

  await prisma.replacementRequest.update({
    where: { id: replacementRequestId },
    data: { status, matchedHelperId },
  });

  const request = await prisma.replacementRequest.findUniqueOrThrow({
    where: { id: replacementRequestId },
    include: { household: true },
  });

  if (status === "MATCHED") {
    await prisma.notification.create({
      data: {
        userId: request.household.userId,
        type: "REPLACEMENT_FOUND",
        title: "Replacement found",
        message: "SevaSetu has found a replacement for your request.",
        link: "/household/replacement",
      },
    });
  }

  revalidatePath("/admin/replacements");
  revalidatePath("/household/replacement");
}
