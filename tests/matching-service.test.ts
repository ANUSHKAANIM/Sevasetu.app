import { describe, it, expect } from "vitest";
import { scoreHelperMatch, type MatchCriteria } from "@/services/matching-service";

const baseCriteria: MatchCriteria = {
  serviceCategoryId: "cat-cleaning",
  locationTier: "TIER_1",
  employmentType: "FULL_TIME",
  minSkillTier: "INTERMEDIATE",
};

describe("scoreHelperMatch", () => {
  it("scores a perfect match at 100", () => {
    const result = scoreHelperMatch(baseCriteria, {
      helperId: "h1",
      offersService: true,
      locationTier: "TIER_1",
      skillTier: "ADVANCED",
      employmentTypePref: ["FULL_TIME"],
      experienceYears: 10,
    });
    expect(result.score).toBe(100);
  });

  it("scores 0 when the helper does not offer the service at all", () => {
    const result = scoreHelperMatch(baseCriteria, {
      helperId: "h2",
      offersService: false,
      locationTier: "TIER_1",
      skillTier: "ADVANCED",
      employmentTypePref: ["FULL_TIME"],
      experienceYears: 10,
    });
    expect(result.breakdown.serviceMatch).toBe(0);
    expect(result.score).toBeLessThan(100);
  });

  it("gives partial credit for a skill tier one level below the requirement", () => {
    const result = scoreHelperMatch(baseCriteria, {
      helperId: "h3",
      offersService: true,
      locationTier: "TIER_1",
      skillTier: "BASIC",
      employmentTypePref: ["FULL_TIME"],
      experienceYears: 10,
    });
    expect(result.breakdown.skillMatch).toBe(10);
  });

  it("gives zero skill credit when two or more tiers below the requirement", () => {
    const result = scoreHelperMatch(
      { ...baseCriteria, minSkillTier: "ADVANCED" },
      {
        helperId: "h4",
        offersService: true,
        locationTier: "TIER_1",
        skillTier: "BASIC",
        employmentTypePref: ["FULL_TIME"],
        experienceYears: 10,
      }
    );
    expect(result.breakdown.skillMatch).toBe(0);
  });

  it("penalizes a location tier mismatch", () => {
    const result = scoreHelperMatch(baseCriteria, {
      helperId: "h5",
      offersService: true,
      locationTier: "TIER_3",
      skillTier: "ADVANCED",
      employmentTypePref: ["FULL_TIME"],
      experienceYears: 10,
    });
    expect(result.breakdown.locationMatch).toBe(0);
  });

  it("caps experience credit at 5 years", () => {
    const fiveYears = scoreHelperMatch(baseCriteria, {
      helperId: "h6",
      offersService: true,
      locationTier: "TIER_1",
      skillTier: "ADVANCED",
      employmentTypePref: ["FULL_TIME"],
      experienceYears: 5,
    });
    const twentyYears = scoreHelperMatch(baseCriteria, {
      helperId: "h7",
      offersService: true,
      locationTier: "TIER_1",
      skillTier: "ADVANCED",
      employmentTypePref: ["FULL_TIME"],
      experienceYears: 20,
    });
    expect(fiveYears.breakdown.experienceMatch).toBe(10);
    expect(twentyYears.breakdown.experienceMatch).toBe(10);
  });
});
