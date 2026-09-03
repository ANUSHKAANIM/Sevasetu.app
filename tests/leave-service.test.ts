import { describe, it, expect } from "vitest";
import { calculateEntitlement, summarizeBalance } from "@/services/leave-service";

describe("calculateEntitlement", () => {
  it("gives full-time helpers the full 15 annual / 12 sick days", () => {
    const entitlement = calculateEntitlement("FULL_TIME");
    expect(entitlement.annualTotal).toBe(15);
    expect(entitlement.sickTotal).toBe(12);
  });

  it("gives live-in helpers the same full entitlement as full-time", () => {
    const entitlement = calculateEntitlement("LIVE_IN");
    expect(entitlement.annualTotal).toBe(15);
    expect(entitlement.sickTotal).toBe(12);
  });

  it("prorates part-time (4h/day) entitlement to half", () => {
    const entitlement = calculateEntitlement("PART_TIME_4H");
    expect(entitlement.annualTotal).toBe(8); // round(15 * 0.5)
    expect(entitlement.sickTotal).toBe(6); // round(12 * 0.5)
  });

  it("prorates the smallest part-time tier (2h/day) to a quarter", () => {
    const entitlement = calculateEntitlement("PART_TIME_2H");
    expect(entitlement.annualTotal).toBe(4); // round(15 * 0.25)
    expect(entitlement.sickTotal).toBe(3); // round(12 * 0.25)
  });
});

describe("summarizeBalance", () => {
  it("computes remaining days as total minus used, floored at zero", () => {
    const summary = summarizeBalance({
      annualTotal: 15,
      annualUsed: 20,
      sickTotal: 12,
      sickUsed: 3,
      unpaidUsed: 0,
    });
    expect(summary.annualRemaining).toBe(0);
    expect(summary.sickRemaining).toBe(9);
  });

  it("passes through unpaid leave used as-is", () => {
    const summary = summarizeBalance({
      annualTotal: 15,
      annualUsed: 5,
      sickTotal: 12,
      sickUsed: 0,
      unpaidUsed: 2,
    });
    expect(summary.unpaidUsed).toBe(2);
    expect(summary.annualRemaining).toBe(10);
  });
});
