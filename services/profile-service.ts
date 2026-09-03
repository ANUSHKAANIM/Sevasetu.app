import "server-only";

export interface HelperProfileCompletenessInput {
  bio: string | null;
  languages: string[];
  experienceYears: number;
  employmentTypePref: string[];
  serviceCount: number;
  skillCount: number;
  hasVerification: boolean;
  completedTrainingCount: number;
}

const WEIGHTS = {
  bio: 10,
  languages: 10,
  experience: 15,
  availability: 15,
  services: 20,
  skills: 15,
  verification: 10,
  training: 5,
};

/** Simple, transparent weighted completeness score out of 100. */
export function calculateProfileCompleteness(
  input: HelperProfileCompletenessInput
): number {
  let score = 0;
  if (input.bio && input.bio.trim().length >= 20) score += WEIGHTS.bio;
  if (input.languages.length > 0) score += WEIGHTS.languages;
  if (input.experienceYears > 0) score += WEIGHTS.experience;
  if (input.employmentTypePref.length > 0) score += WEIGHTS.availability;
  if (input.serviceCount > 0) score += WEIGHTS.services;
  if (input.skillCount > 0) score += WEIGHTS.skills;
  if (input.hasVerification) score += WEIGHTS.verification;
  if (input.completedTrainingCount > 0) score += WEIGHTS.training;
  return Math.min(score, 100);
}
