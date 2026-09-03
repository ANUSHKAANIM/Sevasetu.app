import "server-only";
import { prisma } from "@/lib/prisma";
import type { EmploymentType, LeaveType } from "@prisma/client";

// Configurable full-time-equivalent annual entitlement. Part-time/hourly
// arrangements accrue a prorated share. This mirrors common Indian
// shops-and-establishments leave conventions but is a platform default,
// not a legal determination — see docs/LEGAL_AND_COMPLIANCE.md.
const FULL_TIME_ANNUAL_LEAVE = 15;
const FULL_TIME_SICK_LEAVE = 12;

const EMPLOYMENT_TYPE_PRORATION: Record<EmploymentType, number> = {
  PART_TIME_2H: 0.25,
  PART_TIME_4H: 0.5,
  PART_TIME_8H: 0.75,
  FULL_TIME: 1,
  LIVE_IN: 1,
};

export interface LeaveEntitlement {
  annualTotal: number;
  sickTotal: number;
}

/** Prorates the standard full-time leave entitlement by employment type. */
export function calculateEntitlement(
  employmentType: EmploymentType
): LeaveEntitlement {
  const factor = EMPLOYMENT_TYPE_PRORATION[employmentType];
  return {
    annualTotal: Math.round(FULL_TIME_ANNUAL_LEAVE * factor),
    sickTotal: Math.round(FULL_TIME_SICK_LEAVE * factor),
  };
}

export interface LeaveBalanceSummary {
  annualTotal: number;
  annualUsed: number;
  annualRemaining: number;
  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;
  unpaidUsed: number;
}

export function summarizeBalance(balance: {
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  unpaidUsed: number;
}): LeaveBalanceSummary {
  return {
    annualTotal: balance.annualTotal,
    annualUsed: balance.annualUsed,
    annualRemaining: Math.max(balance.annualTotal - balance.annualUsed, 0),
    sickTotal: balance.sickTotal,
    sickUsed: balance.sickUsed,
    sickRemaining: Math.max(balance.sickTotal - balance.sickUsed, 0),
    unpaidUsed: balance.unpaidUsed,
  };
}

function inclusiveDayCount(startDate: Date, endDate: Date): number {
  const ms = endDate.getTime() - startDate.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export class InsufficientLeaveBalanceError extends Error {
  constructor(leaveType: LeaveType, requested: number, remaining: number) {
    super(
      `Requested ${requested} day(s) of ${leaveType.toLowerCase()} leave but only ${remaining} remain.`
    );
    this.name = "InsufficientLeaveBalanceError";
  }
}

export class LeaveService {
  static async initializeBalance(
    contractId: string,
    employmentType: EmploymentType,
    year: number
  ) {
    const entitlement = calculateEntitlement(employmentType);
    return prisma.leaveBalance.create({
      data: {
        contractId,
        year,
        annualTotal: entitlement.annualTotal,
        sickTotal: entitlement.sickTotal,
      },
    });
  }

  /** Approves a leave request and deducts the days from the contract's balance. */
  static async approve(leaveRequestId: string, reviewedById: string) {
    return prisma.$transaction(async (tx) => {
      const leaveRequest = await tx.leaveRequest.findUniqueOrThrow({
        where: { id: leaveRequestId },
      });

      const days = inclusiveDayCount(
        leaveRequest.startDate,
        leaveRequest.endDate
      );

      if (leaveRequest.leaveType !== "UNPAID") {
        const balance = await tx.leaveBalance.findUniqueOrThrow({
          where: { contractId: leaveRequest.contractId },
        });

        if (leaveRequest.leaveType === "ANNUAL") {
          const remaining = balance.annualTotal - balance.annualUsed;
          if (days > remaining) {
            throw new InsufficientLeaveBalanceError("ANNUAL", days, remaining);
          }
          await tx.leaveBalance.update({
            where: { contractId: leaveRequest.contractId },
            data: { annualUsed: { increment: days } },
          });
        } else if (leaveRequest.leaveType === "SICK") {
          const remaining = balance.sickTotal - balance.sickUsed;
          if (days > remaining) {
            throw new InsufficientLeaveBalanceError("SICK", days, remaining);
          }
          await tx.leaveBalance.update({
            where: { contractId: leaveRequest.contractId },
            data: { sickUsed: { increment: days } },
          });
        }
      } else {
        await tx.leaveBalance.update({
          where: { contractId: leaveRequest.contractId },
          data: { unpaidUsed: { increment: days } },
        });
      }

      return tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "APPROVED",
          reviewedById,
          reviewedAt: new Date(),
        },
      });
    });
  }
}
