"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext, requireHelperContext } from "@/lib/session-helpers";
import { LeaveService } from "@/services/leave-service";

export interface LeaveFormState {
  error?: string;
  success?: boolean;
}

const requestLeaveSchema = z.object({
  contractId: z.string(),
  leaveType: z.enum(["SICK", "ANNUAL", "UNPAID"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(3, "Please provide a short reason."),
});

export async function submitLeaveRequestAction(
  _prevState: LeaveFormState,
  formData: FormData
): Promise<LeaveFormState> {
  const { helperId } = await requireHelperContext();

  const parsed = requestLeaveSchema.safeParse({
    contractId: formData.get("contractId"),
    leaveType: formData.get("leaveType"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid leave request." };
  }

  const contract = await prisma.employmentContract.findUnique({
    where: { id: parsed.data.contractId },
    include: { household: true },
  });
  if (!contract || contract.helperId !== helperId) {
    return { error: "Contract not found." };
  }
  if (new Date(parsed.data.endDate) < new Date(parsed.data.startDate)) {
    return { error: "End date must be on or after the start date." };
  }

  await prisma.leaveRequest.create({
    data: {
      contractId: contract.id,
      leaveType: parsed.data.leaveType,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      reason: parsed.data.reason,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: contract.household.userId,
      type: "GENERAL",
      title: "New leave request",
      message: "A leave request from your helper is waiting for your review.",
      link: "/household/leave",
    },
  });

  revalidatePath("/helper/leave");
  revalidatePath("/household/leave");
  return { success: true };
}

export async function approveLeaveRequestAction(leaveRequestId: string) {
  const { session, householdId } = await requireHouseholdContext();

  const leaveRequest = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id: leaveRequestId },
    include: { contract: { include: { helper: { include: { user: true } } } } },
  });
  if (leaveRequest.contract.householdId !== householdId) {
    throw new Error("This leave request does not belong to your household.");
  }

  await LeaveService.approve(leaveRequestId, session.userId);

  await prisma.notification.create({
    data: {
      userId: leaveRequest.contract.helper.userId,
      type: "LEAVE_APPROVED",
      title: "Leave request approved",
      message: `Your ${leaveRequest.leaveType.toLowerCase()} leave request has been approved.`,
      link: "/helper/leave",
    },
  });

  revalidatePath("/household/leave");
  revalidatePath("/helper/leave");
}

export async function rejectLeaveRequestAction(leaveRequestId: string) {
  const { session, householdId } = await requireHouseholdContext();

  const leaveRequest = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id: leaveRequestId },
    include: { contract: { include: { helper: true } } },
  });
  if (leaveRequest.contract.householdId !== householdId) {
    throw new Error("This leave request does not belong to your household.");
  }

  await prisma.leaveRequest.update({
    where: { id: leaveRequestId },
    data: { status: "REJECTED", reviewedById: session.userId, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: leaveRequest.contract.helper.userId,
      type: "LEAVE_REJECTED",
      title: "Leave request rejected",
      message: `Your ${leaveRequest.leaveType.toLowerCase()} leave request was not approved.`,
      link: "/helper/leave",
    },
  });

  revalidatePath("/household/leave");
  revalidatePath("/helper/leave");
}
