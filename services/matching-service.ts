import "server-only";
import { prisma } from "@/lib/prisma";
import type { EmploymentType, LocationTier, SkillTier } from "@prisma/client";

export interface MatchCriteria {
  serviceCategoryId: string;
  locationTier: LocationTier;
  employmentType: EmploymentType;
  minSkillTier: SkillTier;
}

export interface HelperMatchInput {
  helperId: string;
  offersService: boolean;
  locationTier: LocationTier;
  skillTier: SkillTier;
  employmentTypePref: EmploymentType[];
  experienceYears: number;
}

export interface MatchResult {
  helperId: string;
  score: number;
  breakdown: {
    serviceMatch: number;
    locationMatch: number;
    skillMatch: number;
    availabilityMatch: number;
    experienceMatch: number;
  };
}

const SKILL_RANK: Record<SkillTier, number> = {
  BASIC: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
};

// Documented, fixed weights out of 100. This is intentionally a simple,
// explainable scoring function — not a machine-learning model — so a
// household or helper can see exactly why a match scored the way it did.
const WEIGHTS = {
  service: 35,
  location: 25,
  skill: 20,
  availability: 10,
  experience: 10,
};

/**
 * Transparent job-matching score. Pure function so it's easy to unit test
 * and easy to explain to users: "85% Match" always decomposes into these
 * five documented factors.
 */
export function scoreHelperMatch(
  criteria: MatchCriteria,
  helper: HelperMatchInput
): MatchResult {
  const serviceMatch = helper.offersService ? WEIGHTS.service : 0;

  const locationMatch =
    helper.locationTier === criteria.locationTier ? WEIGHTS.location : 0;

  const skillDelta =
    SKILL_RANK[helper.skillTier] - SKILL_RANK[criteria.minSkillTier];
  const skillMatch =
    skillDelta >= 0
      ? WEIGHTS.skill
      : skillDelta === -1
        ? WEIGHTS.skill * 0.5
        : 0;

  const availabilityMatch = helper.employmentTypePref.includes(
    criteria.employmentType
  )
    ? WEIGHTS.availability
    : 0;

  const experienceMatch =
    Math.min(helper.experienceYears / 5, 1) * WEIGHTS.experience;

  const breakdown = {
    serviceMatch,
    locationMatch,
    skillMatch: Math.round(skillMatch),
    availabilityMatch,
    experienceMatch: Math.round(experienceMatch),
  };

  const score = Math.round(
    breakdown.serviceMatch +
      breakdown.locationMatch +
      breakdown.skillMatch +
      breakdown.availabilityMatch +
      breakdown.experienceMatch
  );

  return { helperId: helper.helperId, score, breakdown };
}

export class MatchingService {
  /** Rank active, verified helpers against a household's job criteria. */
  static async findMatches(
    criteria: MatchCriteria,
    limit = 20
  ): Promise<MatchResult[]> {
    const helpers = await prisma.helperProfile.findMany({
      where: {
        identityVerification: "VERIFIED",
      },
      include: {
        helperServices: { where: { serviceCategoryId: criteria.serviceCategoryId } },
      },
    });

    const results = helpers.map((helper) =>
      scoreHelperMatch(criteria, {
        helperId: helper.id,
        offersService: helper.helperServices.length > 0,
        locationTier: helper.locationTier,
        skillTier: helper.skillTier,
        employmentTypePref: helper.employmentTypePref,
        experienceYears: helper.experienceYears,
      })
    );

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
