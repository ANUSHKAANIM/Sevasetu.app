"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { calculateProfileCompleteness } from "@/services/profile-service";
import { CITY_TIER } from "@/lib/constants";

export interface HelperProfileFormState {
  error?: string;
  success?: boolean;
}

const updateProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  city: z.string().min(2),
  languages: z.array(z.string()).max(6),
  experienceYears: z.coerce.number().int().min(0).max(60),
  employmentTypePref: z
    .array(z.enum(["PART_TIME_2H", "PART_TIME_4H", "PART_TIME_8H", "FULL_TIME", "LIVE_IN"]))
    .min(1, "Select at least one availability option."),
});

async function recalculateAndSaveCompleteness(helperId: string) {
  const helper = await prisma.helperProfile.findUniqueOrThrow({
    where: { id: helperId },
    include: {
      helperServices: true,
      helperSkills: true,
      trainingEnrollments: { where: { status: "COMPLETED" } },
    },
  });

  const completeness = calculateProfileCompleteness({
    bio: helper.bio,
    languages: helper.languages,
    experienceYears: helper.experienceYears,
    employmentTypePref: helper.employmentTypePref,
    serviceCount: helper.helperServices.length,
    skillCount: helper.helperSkills.length,
    hasVerification: helper.identityVerification === "VERIFIED",
    completedTrainingCount: helper.trainingEnrollments.length,
  });

  await prisma.helperProfile.update({
    where: { id: helperId },
    data: { profileCompleteness: completeness },
  });
}

export async function updateHelperProfileAction(
  _prevState: HelperProfileFormState,
  formData: FormData
): Promise<HelperProfileFormState> {
  const { helperId } = await requireHelperContext();

  const parsed = updateProfileSchema.safeParse({
    bio: formData.get("bio") || undefined,
    city: formData.get("city"),
    languages: formData.getAll("languages"),
    experienceYears: formData.get("experienceYears"),
    employmentTypePref: formData.getAll("employmentTypePref"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile data." };
  }

  await prisma.helperProfile.update({
    where: { id: helperId },
    data: {
      bio: parsed.data.bio,
      city: parsed.data.city,
      locationTier: CITY_TIER[parsed.data.city] ?? "TIER_2",
      languages: parsed.data.languages,
      experienceYears: parsed.data.experienceYears,
      employmentTypePref: parsed.data.employmentTypePref,
    },
  });

  await recalculateAndSaveCompleteness(helperId);

  revalidatePath("/helper/profile");
  revalidatePath("/helper/dashboard");
  return { success: true };
}

const addServiceSchema = z.object({
  serviceCategoryId: z.string(),
  yearsExperience: z.coerce.number().int().min(0).max(60),
});

export async function addHelperServiceAction(
  _prevState: HelperProfileFormState,
  formData: FormData
): Promise<HelperProfileFormState> {
  const { helperId } = await requireHelperContext();
  const parsed = addServiceSchema.safeParse({
    serviceCategoryId: formData.get("serviceCategoryId"),
    yearsExperience: formData.get("yearsExperience"),
  });
  if (!parsed.success) {
    return { error: "Select a service and enter valid years of experience." };
  }

  await prisma.helperService.upsert({
    where: {
      helperId_serviceCategoryId: {
        helperId,
        serviceCategoryId: parsed.data.serviceCategoryId,
      },
    },
    create: { helperId, ...parsed.data },
    update: { yearsExperience: parsed.data.yearsExperience },
  });

  await recalculateAndSaveCompleteness(helperId);
  revalidatePath("/helper/profile");
  return { success: true };
}

export async function removeHelperServiceAction(helperServiceId: string) {
  const { helperId } = await requireHelperContext();
  const service = await prisma.helperService.findUniqueOrThrow({ where: { id: helperServiceId } });
  if (service.helperId !== helperId) throw new Error("Not your service listing.");

  await prisma.helperService.delete({ where: { id: helperServiceId } });
  await recalculateAndSaveCompleteness(helperId);
  revalidatePath("/helper/profile");
}
