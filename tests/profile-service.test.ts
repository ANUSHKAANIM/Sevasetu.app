import { describe, it, expect } from "vitest";
import { calculateProfileCompleteness } from "@/services/profile-service";

const complete = {
  bio: "An experienced, reliable professional with a strong track record.",
  languages: ["Hindi", "English"],
  experienceYears: 5,
  employmentTypePref: ["FULL_TIME"],
  serviceCount: 2,
  skillCount: 3,
  hasVerification: true,
  completedTrainingCount: 1,
};

describe("calculateProfileCompleteness", () => {
  it("scores a fully filled-out profile at 100", () => {
    expect(calculateProfileCompleteness(complete)).toBe(100);
  });

  it("scores an empty profile at 0", () => {
    expect(
      calculateProfileCompleteness({
        bio: null,
        languages: [],
        experienceYears: 0,
        employmentTypePref: [],
        serviceCount: 0,
        skillCount: 0,
        hasVerification: false,
        completedTrainingCount: 0,
      })
    ).toBe(0);
  });

  it("does not credit a bio shorter than 20 characters", () => {
    const result = calculateProfileCompleteness({ ...complete, bio: "Too short" });
    expect(result).toBe(90);
  });

  it("never exceeds 100 even if inputs overlap oddly", () => {
    expect(calculateProfileCompleteness({ ...complete, serviceCount: 999 })).toBeLessThanOrEqual(100);
  });
});
