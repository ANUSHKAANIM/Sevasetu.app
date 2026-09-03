import { describe, it, expect } from "vitest";
import { computeBreakdownFromRule } from "@/services/salary-service";

describe("computeBreakdownFromRule", () => {
  it("computes base + skill + scope adjustments and platform fee correctly", () => {
    const result = computeBreakdownFromRule({
      id: "rule-1",
      baseSalary: 10000,
      skillAdjustmentPercent: 10,
      scopeAdjustmentPercent: 8,
      platformFeePercent: 12,
    });

    expect(result.baseSalary).toBe(10000);
    expect(result.skillAdjustment).toBe(1000);
    expect(result.scopeAdjustment).toBe(800);
    expect(result.workerSalary).toBe(11800);
    expect(result.platformFee).toBe(1416);
    expect(result.totalPayment).toBe(13216);
  });

  it("handles zero adjustments (basic skill, basic scope)", () => {
    const result = computeBreakdownFromRule({
      id: "rule-2",
      baseSalary: 5000,
      skillAdjustmentPercent: 0,
      scopeAdjustmentPercent: 0,
      platformFeePercent: 10,
    });

    expect(result.workerSalary).toBe(5000);
    expect(result.platformFee).toBe(500);
    expect(result.totalPayment).toBe(5500);
  });

  it("accepts Decimal-like string inputs, as Prisma returns for Decimal fields", () => {
    const result = computeBreakdownFromRule({
      id: "rule-3",
      baseSalary: "12000.50",
      skillAdjustmentPercent: "20.00",
      scopeAdjustmentPercent: "15.00",
      platformFeePercent: "12.00",
    });

    expect(result.baseSalary).toBeCloseTo(12000.5);
    expect(result.workerSalary).toBeGreaterThan(result.baseSalary);
    expect(result.totalPayment).toBeGreaterThan(result.workerSalary);
  });

  it("worker salary and total payment are always distinctly reported (never conflated)", () => {
    const result = computeBreakdownFromRule({
      id: "rule-4",
      baseSalary: 8000,
      skillAdjustmentPercent: 0,
      scopeAdjustmentPercent: 0,
      platformFeePercent: 12,
    });
    expect(result.totalPayment).not.toBe(result.workerSalary);
    expect(result.totalPayment).toBe(result.workerSalary + result.platformFee);
  });
});
