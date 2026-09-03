import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { SalaryService, NoSalaryRuleError } from "@/services/salary-service";

const bodySchema = z.object({
  helperId: z.string(),
  serviceCategoryId: z.string(),
  employmentType: z.enum([
    "PART_TIME_2H",
    "PART_TIME_4H",
    "PART_TIME_8H",
    "FULL_TIME",
    "LIVE_IN",
  ]),
  scopeOfWork: z.enum(["BASIC", "STANDARD", "EXTENDED"]),
});

/**
 * Live salary preview for the hiring wizard. Location tier and skill tier
 * are intentionally derived server-side from the household's own profile
 * and the target helper's profile — never trusted from the client — so a
 * household can't manipulate the quoted wage by tampering with the request.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "HOUSEHOLD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [household, helper] = await Promise.all([
    prisma.householdProfile.findUnique({ where: { userId: session.userId } }),
    prisma.helperProfile.findUnique({ where: { id: parsed.data.helperId } }),
  ]);

  if (!household || !helper) {
    return NextResponse.json({ error: "Household or helper not found" }, { status: 404 });
  }

  try {
    const breakdown = await SalaryService.compute({
      serviceCategoryId: parsed.data.serviceCategoryId,
      employmentType: parsed.data.employmentType,
      scopeOfWork: parsed.data.scopeOfWork,
      locationTier: household.locationTier,
      skillTier: helper.skillTier,
    });
    return NextResponse.json(breakdown);
  } catch (error) {
    if (error instanceof NoSalaryRuleError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Could not calculate salary. Please try again." },
      { status: 500 }
    );
  }
}
