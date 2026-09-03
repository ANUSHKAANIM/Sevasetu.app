import type { LocationTier } from "@prisma/client";

export const CITY_TIER: Record<string, LocationTier> = {
  Mumbai: "TIER_1",
  Delhi: "TIER_1",
  Bengaluru: "TIER_1",
  Chennai: "TIER_1",
  Hyderabad: "TIER_1",
  Pune: "TIER_1",
  Jaipur: "TIER_2",
  Lucknow: "TIER_2",
  Chandigarh: "TIER_2",
  Indore: "TIER_2",
  Nagpur: "TIER_2",
  Nashik: "TIER_3",
  Ranchi: "TIER_3",
  Bhopal: "TIER_3",
  Coimbatore: "TIER_3",
  Guwahati: "TIER_3",
};

export const CITIES = Object.keys(CITY_TIER);

export const LOCATION_TIER_LABEL: Record<LocationTier, string> = {
  TIER_1: "Tier 1 (Metro)",
  TIER_2: "Tier 2",
  TIER_3: "Tier 3",
};

export const SKILL_TIER_LABEL = {
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
} as const;

export const EMPLOYMENT_TYPE_LABEL = {
  PART_TIME_2H: "Part-time — 2 hrs/day",
  PART_TIME_4H: "Part-time — 4 hrs/day",
  PART_TIME_8H: "Part-time — 8 hrs/day",
  FULL_TIME: "Full-time",
  LIVE_IN: "Live-in",
} as const;

export const SCOPE_OF_WORK_LABEL = {
  BASIC: "Basic",
  STANDARD: "Standard",
  EXTENDED: "Extended",
} as const;

export const VERIFICATION_STATUS_LABEL = {
  NOT_STARTED: "Not started",
  PENDING: "Pending review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
} as const;

export const CONTRACT_STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING: "Pending",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  TERMINATED: "Terminated",
} as const;

export const PAYMENT_STATUS_LABEL = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PAID: "Paid",
  FAILED: "Failed",
  OVERDUE: "Overdue",
} as const;
