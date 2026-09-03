"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext, requireHelperContext } from "@/lib/session-helpers";
import { SalaryService, NoSalaryRuleError } from "@/services/salary-service";
import { LeaveService } from "@/services/leave-service";

const scheduleSchema = z.object({
  days: z.array(z.string()).min(1, "Select at least one working day."),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

const createJobRequestSchema = z.object({
  helperId: z.string(),
  serviceCategoryId: z.string(),
  employmentType: z.enum([
    "PART_TIME_2H",
    "PART_TIME_4H",
    "PART_TIME_8H",
    "FULL_TIME",
    "LIVE_IN",
  ]),
  scopeOfWork: z.enum(["BASIC", "STANDARD", "EXTENDED"]),
  responsibilities: z.array(z.string()).min(1, "List at least one responsibility."),
  message: z.string().optional(),
  schedule: scheduleSchema,
});

export interface JobActionState {
  error?: string;
}

export async function createJobRequestAction(
  input: z.infer<typeof createJobRequestSchema>
): Promise<{ id: string } | { error: string }> {
  const { householdId } = await requireHouseholdContext();
  const parsed = createJobRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const data = parsed.data;

  const [household, helper] = await Promise.all([
    prisma.householdProfile.findUniqueOrThrow({ where: { id: householdId } }),
    prisma.helperProfile.findUniqueOrThrow({ where: { id: data.helperId } }),
  ]);

  let salaryCalculation;
  try {
    salaryCalculation = await SalaryService.computeAndSnapshot({
      serviceCategoryId: data.serviceCategoryId,
      locationTier: household.locationTier,
      skillTier: helper.skillTier,
      employmentType: data.employmentType,
      scopeOfWork: data.scopeOfWork,
      householdId,
      helperId: helper.id,
    });
  } catch (error) {
    if (error instanceof NoSalaryRuleError) {
      return { error: error.message };
    }
    throw error;
  }

  const jobRequest = await prisma.jobRequest.create({
    data: {
      householdId,
      helperId: helper.id,
      serviceCategoryId: data.serviceCategoryId,
      salaryCalculationId: salaryCalculation.id,
      message: data.message,
      responsibilities: data.responsibilities,
      workSchedule: data.schedule,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: helper.userId,
      type: "JOB_MATCH",
      title: "New job request",
      message: `A household in ${household.city} wants to hire you. Review the offer in your job requests.`,
      link: "/helper/jobs",
    },
  });

  revalidatePath("/household/contracts");
  return { id: jobRequest.id };
}

export async function acceptJobRequestAction(jobRequestId: string) {
  const { helperId } = await requireHelperContext();

  const jobRequest = await prisma.jobRequest.findUniqueOrThrow({
    where: { id: jobRequestId },
    include: { household: true, salaryCalculation: true },
  });

  if (jobRequest.helperId !== helperId) {
    throw new Error("This job request does not belong to you.");
  }
  if (jobRequest.status !== "PENDING") {
    throw new Error("This job request has already been actioned.");
  }
  if (!jobRequest.salaryCalculationId) {
    throw new Error("Missing salary calculation for this job request.");
  }

  const contract = await prisma.$transaction(async (tx) => {
    const created = await tx.employmentContract.create({
      data: {
        householdId: jobRequest.householdId,
        helperId: jobRequest.helperId,
        serviceCategoryId: jobRequest.serviceCategoryId,
        jobRequestId: jobRequest.id,
        salaryCalculationId: jobRequest.salaryCalculationId!,
        responsibilities: jobRequest.responsibilities,
        workSchedule: jobRequest.workSchedule ?? {},
        leavePolicy: { annualLeave: 15, sickLeave: 12, noticePeriodDays: 15 },
        startDate: new Date(),
        status: "ACTIVE",
      },
    });

    await tx.paymentSchedule.create({
      data: { contractId: created.id, dueDayOfMonth: 5 },
    });

    await tx.jobRequest.update({
      where: { id: jobRequest.id },
      data: { status: "CONVERTED" },
    });

    return created;
  });

  await LeaveService.initializeBalance(
    contract.id,
    jobRequest.salaryCalculation!.employmentType,
    new Date().getFullYear()
  );

  await prisma.notification.create({
    data: {
      userId: jobRequest.household.userId,
      type: "CONTRACT_UPDATE",
      title: "Job request accepted",
      message: "Your job request was accepted and a contract is now active.",
      link: `/household/contracts/${contract.id}`,
    },
  });

  revalidatePath("/helper/jobs");
  revalidatePath("/household/contracts");
  redirect(`/helper/contracts/${contract.id}`);
}

export async function declineJobRequestAction(jobRequestId: string) {
  const { helperId } = await requireHelperContext();

  const jobRequest = await prisma.jobRequest.findUniqueOrThrow({
    where: { id: jobRequestId },
    include: { household: true },
  });
  if (jobRequest.helperId !== helperId) {
    throw new Error("This job request does not belong to you.");
  }

  await prisma.jobRequest.update({
    where: { id: jobRequestId },
    data: { status: "DECLINED" },
  });

  await prisma.notification.create({
    data: {
      userId: jobRequest.household.userId,
      type: "GENERAL",
      title: "Job request declined",
      message: "The service professional was unable to accept your job request.",
      link: "/household/search",
    },
  });

  revalidatePath("/helper/jobs");
}
