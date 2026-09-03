"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";

export async function toggleUserActiveAction(userId: string) {
  await requireAdminContext();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/admin/users");
}

const verificationFieldSchema = z.enum([
  "identityVerification",
  "addressVerification",
  "referenceVerification",
  "backgroundCheck",
]);
const verificationStatusSchema = z.enum(["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED"]);

export async function updateVerificationFieldAction(
  helperId: string,
  field: z.infer<typeof verificationFieldSchema>,
  status: z.infer<typeof verificationStatusSchema>
) {
  await requireAdminContext();
  verificationFieldSchema.parse(field);
  verificationStatusSchema.parse(status);

  const helper = await prisma.helperProfile.update({
    where: { id: helperId },
    data: { [field]: status },
  });

  await prisma.notification.create({
    data: {
      userId: helper.userId,
      type: "VERIFICATION_UPDATED",
      title: "Verification status updated",
      message: `Your ${field.replace("Verification", "").replace("backgroundCheck", "background check")} status is now ${status.replace("_", " ").toLowerCase()}.`,
      link: "/helper/profile",
    },
  });

  revalidatePath("/admin/verification");
  revalidatePath("/helper/profile");
}

export interface SalaryRuleFormState {
  error?: string;
  success?: boolean;
}

const salaryRuleSchema = z.object({
  serviceCategoryId: z.string(),
  locationTier: z.enum(["TIER_1", "TIER_2", "TIER_3"]),
  skillTier: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  employmentType: z.enum([
    "PART_TIME_2H",
    "PART_TIME_4H",
    "PART_TIME_8H",
    "FULL_TIME",
    "LIVE_IN",
  ]),
  scopeOfWork: z.enum(["BASIC", "STANDARD", "EXTENDED"]),
  baseSalary: z.coerce.number().positive(),
  skillAdjustmentPercent: z.coerce.number().min(0).max(200),
  scopeAdjustmentPercent: z.coerce.number().min(0).max(200),
  platformFeePercent: z.coerce.number().min(0).max(100),
});

export async function upsertSalaryRuleAction(
  _prevState: SalaryRuleFormState,
  formData: FormData
): Promise<SalaryRuleFormState> {
  await requireAdminContext();

  const parsed = salaryRuleSchema.safeParse({
    serviceCategoryId: formData.get("serviceCategoryId"),
    locationTier: formData.get("locationTier"),
    skillTier: formData.get("skillTier"),
    employmentType: formData.get("employmentType"),
    scopeOfWork: formData.get("scopeOfWork"),
    baseSalary: formData.get("baseSalary"),
    skillAdjustmentPercent: formData.get("skillAdjustmentPercent"),
    scopeAdjustmentPercent: formData.get("scopeAdjustmentPercent"),
    platformFeePercent: formData.get("platformFeePercent"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid salary rule." };
  }

  const { serviceCategoryId, locationTier, skillTier, employmentType, scopeOfWork, ...rest } =
    parsed.data;

  await prisma.salaryRule.upsert({
    where: {
      serviceCategoryId_locationTier_skillTier_employmentType_scopeOfWork: {
        serviceCategoryId,
        locationTier,
        skillTier,
        employmentType,
        scopeOfWork,
      },
    },
    create: { serviceCategoryId, locationTier, skillTier, employmentType, scopeOfWork, ...rest },
    update: rest,
  });

  revalidatePath("/admin/salary-rules");
  return { success: true };
}

export async function toggleSalaryRuleActiveAction(salaryRuleId: string) {
  await requireAdminContext();
  const rule = await prisma.salaryRule.findUniqueOrThrow({ where: { id: salaryRuleId } });
  await prisma.salaryRule.update({
    where: { id: salaryRuleId },
    data: { isActive: !rule.isActive },
  });
  revalidatePath("/admin/salary-rules");
}
