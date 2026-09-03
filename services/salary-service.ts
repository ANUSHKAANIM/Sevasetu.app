import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  EmploymentType,
  LocationTier,
  ScopeOfWork,
  SkillTier,
} from "@prisma/client";

export interface SalaryCalculationInput {
  serviceCategoryId: string;
  locationTier: LocationTier;
  skillTier: SkillTier;
  employmentType: EmploymentType;
  scopeOfWork: ScopeOfWork;
  householdId?: string;
  helperId?: string;
}

export interface SalaryBreakdown {
  salaryRuleId: string | null;
  baseSalary: number;
  skillAdjustment: number;
  scopeAdjustment: number;
  workerSalary: number;
  platformFee: number;
  totalPayment: number;
  platformFeePercent: number;
}

export class NoSalaryRuleError extends Error {
  constructor(input: SalaryCalculationInput) {
    super(
      `No active salary rule found for this combination of service, location, skill tier, employment type and scope of work. An administrator needs to configure it in Salary Rule Management.`
    );
    this.name = "NoSalaryRuleError";
    this.input = input;
  }
  input: SalaryCalculationInput;
}

// Accepts either plain numbers/strings (as used in tests) or Prisma's
// Decimal type (as returned by prisma.salaryRule.findFirst) — anything
// that Number() can coerce.
type Numeric = number | string | { toString(): string };

export interface SalaryRuleLike {
  id: string;
  baseSalary: Numeric;
  skillAdjustmentPercent: Numeric;
  scopeAdjustmentPercent: Numeric;
  platformFeePercent: Numeric;
}

/**
 * Pure calculation, deliberately kept free of any database access so the
 * arithmetic itself is trivial to unit test and to audit.
 */
export function computeBreakdownFromRule(rule: SalaryRuleLike): SalaryBreakdown {
  const base = Number(rule.baseSalary);
  const skillAdjustment = round2(
    (base * Number(rule.skillAdjustmentPercent)) / 100
  );
  const scopeAdjustment = round2(
    (base * Number(rule.scopeAdjustmentPercent)) / 100
  );
  const workerSalary = round2(base + skillAdjustment + scopeAdjustment);
  const platformFee = round2(
    (workerSalary * Number(rule.platformFeePercent)) / 100
  );
  const totalPayment = round2(workerSalary + platformFee);

  return {
    salaryRuleId: rule.id,
    baseSalary: base,
    skillAdjustment,
    scopeAdjustment,
    workerSalary,
    platformFee,
    totalPayment,
    platformFeePercent: Number(rule.platformFeePercent),
  };
}

/**
 * SevaSetu's standardized wage engine. Wages are never freely negotiated in
 * the product — they are always derived from an admin-configured SalaryRule
 * so pay stays consistent and transparent across the platform.
 */
export class SalaryService {
  /** Compute a live breakdown without persisting anything. */
  static async compute(
    input: SalaryCalculationInput
  ): Promise<SalaryBreakdown> {
    const rule = await prisma.salaryRule.findFirst({
      where: {
        serviceCategoryId: input.serviceCategoryId,
        locationTier: input.locationTier,
        skillTier: input.skillTier,
        employmentType: input.employmentType,
        scopeOfWork: input.scopeOfWork,
        isActive: true,
      },
      orderBy: { effectiveFrom: "desc" },
    });

    if (!rule) throw new NoSalaryRuleError(input);

    return computeBreakdownFromRule(rule);
  }

  /**
   * Compute and persist a frozen SalaryCalculation snapshot. Contracts and
   * job requests should always reference a snapshot id, never a live
   * SalaryRule, so future rule edits don't retroactively change pay under
   * an existing agreement.
   */
  static async computeAndSnapshot(
    input: SalaryCalculationInput
  ): Promise<{ id: string } & SalaryBreakdown> {
    const breakdown = await this.compute(input);

    const snapshot = await prisma.salaryCalculation.create({
      data: {
        salaryRuleId: breakdown.salaryRuleId,
        householdId: input.householdId,
        helperId: input.helperId,
        serviceCategoryId: input.serviceCategoryId,
        locationTier: input.locationTier,
        skillTier: input.skillTier,
        employmentType: input.employmentType,
        scopeOfWork: input.scopeOfWork,
        baseSalary: breakdown.baseSalary,
        skillAdjustment: breakdown.skillAdjustment,
        scopeAdjustment: breakdown.scopeAdjustment,
        workerSalary: breakdown.workerSalary,
        platformFee: breakdown.platformFee,
        totalPayment: breakdown.totalPayment,
      },
    });

    return { id: snapshot.id, ...breakdown };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
