import "dotenv/config";
import { PrismaClient, type EmploymentType, type LocationTier, type SkillCategory, type SkillTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// max: 1 works around `prisma dev`'s lightweight local server dropping
// connections under concurrency — see lib/prisma.ts for details.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Password123!";

const CITY_TIER: Record<string, LocationTier> = {
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

const SERVICE_CATEGORIES = [
  { name: "House Cleaning", slug: "house-cleaning", description: "Sweeping, mopping, dusting, deep cleaning and household upkeep.", icon: "sparkles" },
  { name: "Cooking", slug: "cooking", description: "Daily meal preparation across regional and dietary preferences.", icon: "cooking-pot" },
  { name: "Child Care", slug: "child-care", description: "Nanny and childminding support for infants and young children.", icon: "baby" },
  { name: "Elderly Care", slug: "elderly-care", description: "Companionship and daily-living support for elderly family members.", icon: "heart-handshake" },
  { name: "Driving", slug: "driving", description: "Personal and family driving with route familiarity and vehicle care.", icon: "car" },
  { name: "Live-in Assistance", slug: "live-in-assistance", description: "Full-time, live-in household help across combined responsibilities.", icon: "home" },
] as const;

const EMPLOYMENT_TYPES_BY_CATEGORY: Record<string, EmploymentType[]> = {
  "house-cleaning": ["PART_TIME_2H", "PART_TIME_4H", "PART_TIME_8H", "FULL_TIME"],
  cooking: ["PART_TIME_2H", "PART_TIME_4H", "FULL_TIME"],
  "child-care": ["PART_TIME_4H", "PART_TIME_8H", "FULL_TIME", "LIVE_IN"],
  "elderly-care": ["PART_TIME_8H", "FULL_TIME", "LIVE_IN"],
  driving: ["PART_TIME_4H", "PART_TIME_8H", "FULL_TIME"],
  "live-in-assistance": ["FULL_TIME", "LIVE_IN"],
};

const CATEGORY_MULTIPLIER: Record<string, number> = {
  "house-cleaning": 1.0,
  cooking: 1.15,
  "child-care": 1.25,
  "elderly-care": 1.3,
  driving: 1.1,
  "live-in-assistance": 1.2,
};

const EMPLOYMENT_BASE: Record<EmploymentType, number> = {
  PART_TIME_2H: 3000,
  PART_TIME_4H: 5500,
  PART_TIME_8H: 9500,
  FULL_TIME: 14000,
  LIVE_IN: 18000,
};

const LOCATION_MULTIPLIER: Record<LocationTier, number> = {
  TIER_1: 1.0,
  TIER_2: 0.85,
  TIER_3: 0.72,
};

const SKILL_ADJUSTMENT_PERCENT: Record<SkillTier, number> = {
  BASIC: 0,
  INTERMEDIATE: 10,
  ADVANCED: 20,
};

const SCOPE_ADJUSTMENT_PERCENT = { BASIC: 0, STANDARD: 8, EXTENDED: 15 } as const;

const SKILLS: { name: string; category: SkillCategory }[] = [
  { name: "Basic cleaning", category: "CLEANING" },
  { name: "Deep cleaning", category: "CLEANING" },
  { name: "Laundry", category: "CLEANING" },
  { name: "Ironing", category: "CLEANING" },
  { name: "Household organization", category: "CLEANING" },
  { name: "North Indian cuisine", category: "COOKING" },
  { name: "South Indian cuisine", category: "COOKING" },
  { name: "Vegetarian cooking", category: "COOKING" },
  { name: "Non-vegetarian cooking", category: "COOKING" },
  { name: "Baking", category: "COOKING" },
  { name: "Infant care", category: "CHILD_CARE" },
  { name: "Child safety", category: "CHILD_CARE" },
  { name: "Basic first-aid awareness", category: "CHILD_CARE" },
  { name: "Mobility assistance", category: "ELDERLY_CARE" },
  { name: "Basic care", category: "ELDERLY_CARE" },
  { name: "Emergency awareness", category: "ELDERLY_CARE" },
  { name: "Safe driving", category: "DRIVING" },
  { name: "Route familiarity", category: "DRIVING" },
  { name: "Vehicle care", category: "DRIVING" },
];

const TRAINING_COURSES: { title: string; description: string; category: SkillCategory; durationHours: number }[] = [
  { title: "Deep Cleaning Fundamentals", description: "Modern deep-cleaning techniques, tools and safe chemical handling.", category: "CLEANING", durationHours: 6 },
  { title: "Household Organization Essentials", description: "Systems for tidy, well-organized homes.", category: "CLEANING", durationHours: 4 },
  { title: "North & South Indian Cooking", description: "Regional cuisine fundamentals across both traditions.", category: "COOKING", durationHours: 10 },
  { title: "Hygiene & Nutrition in Home Cooking", description: "Food safety, hygiene and balanced meal planning.", category: "COOKING", durationHours: 5 },
  { title: "Infant & Child Safety Certification", description: "Safe child-handling practices and hazard awareness.", category: "CHILD_CARE", durationHours: 8 },
  { title: "Elderly Care & Mobility Support", description: "Assisting elderly family members with daily mobility and routines.", category: "ELDERLY_CARE", durationHours: 8 },
  { title: "First Aid & Emergency Response", description: "Foundational first-aid skills for household emergencies.", category: "ELDERLY_CARE", durationHours: 6 },
  { title: "Defensive & Safe Driving", description: "Safe driving practices, route planning and vehicle upkeep.", category: "DRIVING", durationHours: 6 },
];

const FEMALE_NAMES = [
  "Priya Sharma", "Anita Devi", "Sunita Kumari", "Meena Yadav", "Rekha Singh",
  "Kavita Joshi", "Pooja Verma", "Geeta Patil", "Lakshmi Nair", "Radha Iyer",
  "Suman Chauhan", "Nirmala Reddy", "Shanti Gupta", "Manju Mishra", "Kamla Bhat",
];
const MALE_NAMES = [
  "Ramesh Kumar", "Suresh Yadav", "Mahesh Patil", "Vijay Singh", "Ravi Shankar",
  "Anil Sharma", "Deepak Verma", "Ajay Mishra", "Sanjay Gupta", "Rajesh Nair",
];

const HOUSEHOLD_NAMES = [
  "Arjun Mehta", "Kavya Reddy", "Rohan Kapoor", "Ishita Bose", "Aditya Malhotra", "Neha Chopra",
];

const LANGUAGES_POOL = ["Hindi", "English", "Marathi", "Tamil", "Telugu", "Bengali", "Kannada", "Punjabi"];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding SevaSetu demo data...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------------------------------------------------------------------
  // Wipe existing data (idempotent local dev seed)
  // ---------------------------------------------------------------------
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.grievanceMessage.deleteMany(),
    prisma.grievance.deleteMany(),
    prisma.review.deleteMany(),
    prisma.replacementRequest.deleteMany(),
    prisma.benefitContribution.deleteMany(),
    prisma.insuranceEnrollment.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.paymentSchedule.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.leaveBalance.deleteMany(),
    prisma.attendanceRecord.deleteMany(),
    prisma.employmentContract.deleteMany(),
    prisma.jobRequest.deleteMany(),
    prisma.salaryCalculation.deleteMany(),
    prisma.salaryRule.deleteMany(),
    prisma.skillAssessment.deleteMany(),
    prisma.trainingEnrollment.deleteMany(),
    prisma.trainingCourse.deleteMany(),
    prisma.helperSkill.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.helperService.deleteMany(),
    prisma.serviceCategory.deleteMany(),
    prisma.helperProfile.deleteMany(),
    prisma.householdProfile.deleteMany(),
    prisma.adminProfile.deleteMany(),
    prisma.user.deleteMany(),
  ], { maxWait: 30000, timeout: 30000 });

  // ---------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@sevasetu.in",
      passwordHash,
      role: "ADMIN",
      name: "SevaSetu Admin",
      phone: "+91 90000 00001",
      adminProfile: { create: { department: "Operations" } },
    },
  });

  // ---------------------------------------------------------------------
  // Service categories & skills
  // ---------------------------------------------------------------------
  const categories = await Promise.all(
    SERVICE_CATEGORIES.map((c) => prisma.serviceCategory.create({ data: c }))
  );
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const skills = await Promise.all(
    SKILLS.map((s) => prisma.skill.create({ data: s }))
  );

  const courses = await Promise.all(
    TRAINING_COURSES.map((c) => prisma.trainingCourse.create({ data: c }))
  );

  // ---------------------------------------------------------------------
  // Salary rules: generated across category x employmentType x skillTier x scope
  // ---------------------------------------------------------------------
  const skillTiers: SkillTier[] = ["BASIC", "INTERMEDIATE", "ADVANCED"];
  const scopes = ["BASIC", "STANDARD", "EXTENDED"] as const;
  const locationTiers: LocationTier[] = ["TIER_1", "TIER_2", "TIER_3"];

  for (const cat of SERVICE_CATEGORIES) {
    const employmentTypes = EMPLOYMENT_TYPES_BY_CATEGORY[cat.slug];
    for (const employmentType of employmentTypes) {
      for (const locationTier of locationTiers) {
        const base = Math.round(
          EMPLOYMENT_BASE[employmentType] *
            CATEGORY_MULTIPLIER[cat.slug] *
            LOCATION_MULTIPLIER[locationTier]
        );
        for (const skillTier of skillTiers) {
          for (const scopeOfWork of scopes) {
            await prisma.salaryRule.create({
              data: {
                serviceCategoryId: categoryBySlug[cat.slug].id,
                locationTier,
                skillTier,
                employmentType,
                scopeOfWork,
                baseSalary: base,
                skillAdjustmentPercent: SKILL_ADJUSTMENT_PERCENT[skillTier],
                scopeAdjustmentPercent: SCOPE_ADJUSTMENT_PERCENT[scopeOfWork],
                platformFeePercent: 12,
              },
            });
          }
        }
      }
    }
  }
  console.log("Created salary rules.");

  // ---------------------------------------------------------------------
  // Households
  // ---------------------------------------------------------------------
  const householdCities = ["Mumbai", "Delhi", "Bengaluru", "Jaipur", "Nashik", "Pune"];
  const households = [];
  for (let i = 0; i < HOUSEHOLD_NAMES.length; i++) {
    const city = pick(householdCities, i);
    const user = await prisma.user.create({
      data: {
        email: `household${i + 1}@sevasetu.in`,
        passwordHash,
        role: "HOUSEHOLD",
        name: HOUSEHOLD_NAMES[i],
        phone: `+91 98${(100000 + i).toString().padStart(6, "0")}`,
        householdProfile: {
          create: {
            city,
            locationTier: CITY_TIER[city],
            addressLine: `${100 + i} Garden Layout`,
            familySize: 2 + (i % 4),
          },
        },
      },
      include: { householdProfile: true },
    });
    households.push(user);
  }
  const demoHousehold = households[0];
  console.log(`Created ${households.length} households.`);

  // ---------------------------------------------------------------------
  // Helpers (20+)
  // ---------------------------------------------------------------------
  const helperCities = Object.keys(CITY_TIER);
  const allNames = [...FEMALE_NAMES, ...MALE_NAMES];
  const helperCount = 24;
  const helpers = [];

  for (let i = 0; i < helperCount; i++) {
    const name = pick(allNames, i);
    const city = pick(helperCities, i);
    const locationTier = CITY_TIER[city];
    const skillTier: SkillTier = i % 5 === 0 ? "ADVANCED" : i % 2 === 0 ? "INTERMEDIATE" : "BASIC";
    const experienceYears = (i % 12) + 1;
    const primaryCategory = SERVICE_CATEGORIES[i % SERVICE_CATEGORIES.length];
    const secondaryCategory = SERVICE_CATEGORIES[(i + 2) % SERVICE_CATEGORIES.length];
    const employmentPrefs = EMPLOYMENT_TYPES_BY_CATEGORY[primaryCategory.slug].slice(0, 2);
    const languages = [
      pick(LANGUAGES_POOL, i),
      pick(LANGUAGES_POOL, i + 3),
    ];
    const isVerified = i % 4 !== 0; // most are verified, a few pending/rejected for demo variety
    const verificationStatus = isVerified ? "VERIFIED" : i % 8 === 0 ? "REJECTED" : "PENDING";

    const user = await prisma.user.create({
      data: {
        email: `helper${i + 1}@sevasetu.in`,
        passwordHash,
        role: "HELPER",
        name,
        phone: `+91 97${(200000 + i).toString().padStart(6, "0")}`,
        helperProfile: {
          create: {
            bio: `${name.split(" ")[0]} is an experienced ${primaryCategory.name.toLowerCase()} professional with ${experienceYears} year(s) of experience.`,
            gender: FEMALE_NAMES.includes(name) ? "Female" : "Male",
            city,
            locationTier,
            languages,
            experienceYears,
            skillTier,
            employmentTypePref: employmentPrefs,
            availableFrom: daysAgo(0),
            identityVerification: verificationStatus,
            addressVerification: verificationStatus,
            referenceVerification: isVerified ? "VERIFIED" : "NOT_STARTED",
            backgroundCheck: isVerified ? "VERIFIED" : "NOT_STARTED",
            profileCompleteness: isVerified ? 90 + (i % 10) : 55 + (i % 20),
            helperServices: {
              create: [
                { serviceCategoryId: categoryBySlug[primaryCategory.slug].id, yearsExperience: experienceYears },
                { serviceCategoryId: categoryBySlug[secondaryCategory.slug].id, yearsExperience: Math.max(1, experienceYears - 2) },
              ],
            },
          },
        },
      },
      include: { helperProfile: true },
    });
    helpers.push(user);

    // Skills relevant to primary category
    const relevantSkills = skills.filter((s) => s.category === skillCategoryForSlug(primaryCategory.slug));
    for (const skill of relevantSkills.slice(0, 3)) {
      await prisma.helperSkill.create({
        data: { helperId: user.helperProfile!.id, skillId: skill.id, level: skillTier },
      });
    }

    // A skill assessment record
    await prisma.skillAssessment.create({
      data: {
        helperId: user.helperProfile!.id,
        category: skillCategoryForSlug(primaryCategory.slug),
        score: skillTier === "ADVANCED" ? 88 + (i % 10) : skillTier === "INTERMEDIATE" ? 65 + (i % 15) : 40 + (i % 20),
        assessorName: "SevaSetu Skills Panel",
        result: skillTier,
        assessedAt: daysAgo(30 + i),
      },
    });

    // A training enrollment
    const course = pick(courses, i);
    const enrollmentStatus = i % 3 === 0 ? "COMPLETED" : i % 3 === 1 ? "IN_PROGRESS" : "NOT_STARTED";
    await prisma.trainingEnrollment.create({
      data: {
        helperId: user.helperProfile!.id,
        courseId: course.id,
        status: enrollmentStatus,
        progress: enrollmentStatus === "COMPLETED" ? 100 : enrollmentStatus === "IN_PROGRESS" ? 45 : 0,
        completedAt: enrollmentStatus === "COMPLETED" ? daysAgo(10 + i) : null,
        certificateRef: enrollmentStatus === "COMPLETED" ? `CERT-${course.id.slice(-6).toUpperCase()}-${i}` : null,
      },
    });

    // Benefits + insurance demo records for verified helpers
    if (isVerified) {
      const now = new Date();
      await prisma.benefitContribution.create({
        data: {
          helperId: user.helperProfile!.id,
          benefitType: "PF",
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          employeeAmount: 500,
          employerAmount: 500,
        },
      });
      await prisma.insuranceEnrollment.create({
        data: {
          helperId: user.helperProfile!.id,
          provider: "Demo Insurance Partner (integration pending)",
          policyType: "Basic Health Cover",
          status: i % 2 === 0 ? "ACTIVE" : "PENDING",
          enrolledAt: i % 2 === 0 ? daysAgo(60) : null,
        },
      });
    }
  }
  console.log(`Created ${helpers.length} helpers.`);

  // ---------------------------------------------------------------------
  // Active contracts between a few households and helpers, with salary
  // snapshots, attendance, leave, payments, reviews
  // ---------------------------------------------------------------------
  const verifiedHelpers = helpers.filter((h) => h.helperProfile!.identityVerification === "VERIFIED");
  const contractCount = Math.min(households.length, verifiedHelpers.length, 6);

  for (let i = 0; i < contractCount; i++) {
    const household = households[i];
    const helper = verifiedHelpers[i];
    const helperProfile = helper.helperProfile!;
    const householdProfile = household.householdProfile!;

    const helperServices = await prisma.helperService.findMany({ where: { helperId: helperProfile.id } });
    const serviceCategoryId = helperServices[0].serviceCategoryId;

    const rule = await prisma.salaryRule.findFirstOrThrow({
      where: {
        serviceCategoryId,
        locationTier: householdProfile.locationTier,
        skillTier: helperProfile.skillTier,
        employmentType: helperProfile.employmentTypePref[0],
        scopeOfWork: "STANDARD",
        isActive: true,
      },
    });

    const base = Number(rule.baseSalary);
    const skillAdjustment = Math.round((base * Number(rule.skillAdjustmentPercent)) / 100);
    const scopeAdjustment = Math.round((base * Number(rule.scopeAdjustmentPercent)) / 100);
    const workerSalary = base + skillAdjustment + scopeAdjustment;
    const platformFee = Math.round((workerSalary * Number(rule.platformFeePercent)) / 100);
    const totalPayment = workerSalary + platformFee;

    const salaryCalculation = await prisma.salaryCalculation.create({
      data: {
        salaryRuleId: rule.id,
        householdId: householdProfile.id,
        helperId: helperProfile.id,
        serviceCategoryId,
        locationTier: householdProfile.locationTier,
        skillTier: helperProfile.skillTier,
        employmentType: helperProfile.employmentTypePref[0],
        scopeOfWork: "STANDARD",
        baseSalary: base,
        skillAdjustment,
        scopeAdjustment,
        workerSalary,
        platformFee,
        totalPayment,
      },
    });

    const contract = await prisma.employmentContract.create({
      data: {
        householdId: householdProfile.id,
        helperId: helperProfile.id,
        serviceCategoryId,
        salaryCalculationId: salaryCalculation.id,
        responsibilities: ["Daily household cleaning", "Laundry & ironing", "Kitchen upkeep"],
        workSchedule: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], startTime: "09:00", endTime: "13:00" },
        leavePolicy: { annualLeave: 15, sickLeave: 12, noticePeriodDays: 15 },
        startDate: daysAgo(90),
        status: "ACTIVE",
      },
    });

    await prisma.paymentSchedule.create({ data: { contractId: contract.id, dueDayOfMonth: 5 } });

    await prisma.leaveBalance.create({
      data: {
        contractId: contract.id,
        year: new Date().getFullYear(),
        annualUsed: i,
        sickUsed: i % 2,
      },
    });

    // Attendance for the last 20 days
    for (let d = 20; d >= 1; d--) {
      const status = d % 9 === 0 ? "LEAVE" : d % 13 === 0 ? "ABSENT" : "PRESENT";
      await prisma.attendanceRecord.create({
        data: {
          contractId: contract.id,
          date: daysAgo(d),
          status,
          markedById: householdProfile.id,
          notes: status === "ABSENT" ? "No prior notice given" : null,
        },
      });
    }

    // One leave request
    await prisma.leaveRequest.create({
      data: {
        contractId: contract.id,
        leaveType: i % 2 === 0 ? "SICK" : "ANNUAL",
        startDate: daysAgo(5),
        endDate: daysAgo(4),
        reason: i % 2 === 0 ? "Fever, resting at home" : "Family function",
        status: i === 0 ? "PENDING" : "APPROVED",
        reviewedById: i === 0 ? null : householdProfile.id,
        reviewedAt: i === 0 ? null : daysAgo(6),
      },
    });

    // Payments: last 3 months, mixed statuses
    const now = new Date();
    for (let m = 2; m >= 0; m--) {
      const period = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const status = m === 0 ? "PENDING" : m === 1 ? "PAID" : "PAID";
      await prisma.payment.create({
        data: {
          contractId: contract.id,
          householdId: householdProfile.id,
          helperId: helperProfile.id,
          periodMonth: period.getMonth() + 1,
          periodYear: period.getFullYear(),
          workerSalary,
          platformFee,
          totalAmount: totalPayment,
          status,
          dueDate: new Date(period.getFullYear(), period.getMonth(), 5),
          paidAt: status === "PAID" ? new Date(period.getFullYear(), period.getMonth(), 4) : null,
          providerRef: status === "PAID" ? `MOCK-${contract.id.slice(-6).toUpperCase()}-${m}` : null,
        },
      });
    }

    // A review for well-established contracts
    if (i < 4) {
      await prisma.review.create({
        data: {
          contractId: contract.id,
          householdId: householdProfile.id,
          helperId: helperProfile.id,
          rating: 4 + (i % 2),
          comment: "Reliable, punctual, and does thorough work.",
        },
      });
    }

    // Notifications
    await prisma.notification.create({
      data: {
        userId: household.id,
        type: "PAYMENT_DUE",
        title: "Payment due soon",
        message: `This month's payment for ${helper.name} is due on the 5th.`,
        link: "/household/payments",
      },
    });
    await prisma.notification.create({
      data: {
        userId: helper.id,
        type: "CONTRACT_UPDATE",
        title: "Contract active",
        message: `Your employment contract with ${household.name} is now active.`,
        link: "/helper/dashboard",
      },
    });
  }
  console.log(`Created ${contractCount} active employment contracts with attendance/leave/payments.`);

  // ---------------------------------------------------------------------
  // A couple of open, unconverted job requests for the demo household
  // ---------------------------------------------------------------------
  const openHelperCandidates = verifiedHelpers.slice(contractCount, contractCount + 2);
  for (const candidate of openHelperCandidates) {
    const helperProfile = candidate.helperProfile!;
    const service = await prisma.helperService.findFirstOrThrow({ where: { helperId: helperProfile.id } });
    await prisma.jobRequest.create({
      data: {
        householdId: demoHousehold.householdProfile!.id,
        helperId: helperProfile.id,
        serviceCategoryId: service.serviceCategoryId,
        status: "PENDING",
        message: "Looking forward to discussing a part-time arrangement.",
        responsibilities: ["General housekeeping"],
      },
    });
  }

  // ---------------------------------------------------------------------
  // A replacement request and a grievance for demo purposes
  // ---------------------------------------------------------------------
  const firstContract = await prisma.employmentContract.findFirstOrThrow({
    orderBy: { createdAt: "asc" },
  });
  await prisma.replacementRequest.create({
    data: {
      contractId: firstContract.id,
      householdId: firstContract.householdId,
      originalHelperId: firstContract.helperId,
      type: "TEMPORARY",
      reason: "Helper is on approved medical leave for two weeks.",
      status: "OPEN",
    },
  });

  const grievance = await prisma.grievance.create({
    data: {
      raisedById: demoHousehold.id,
      contractId: firstContract.id,
      category: "PAYMENT_ISSUE",
      subject: "Payment reflected late",
      description: "Last month's payment was marked paid two days after the due date. Please confirm this won't recur.",
      status: "UNDER_REVIEW",
      adminNotes: "Checked with payments team; provider settlement delay, not a platform error.",
    },
  });
  await prisma.grievanceMessage.create({
    data: {
      grievanceId: grievance.id,
      authorId: adminUser.id,
      message: "Thanks for flagging this — we've confirmed it was a one-off settlement delay and not a recurring issue.",
      isInternalNote: false,
    },
  });

  console.log("Seed complete.");
  console.log("\nDemo accounts (password for all: Password123!):");
  console.log("  Admin:     admin@sevasetu.in");
  console.log("  Household: household1@sevasetu.in");
  console.log("  Helper:    helper1@sevasetu.in");
}

function skillCategoryForSlug(slug: string): SkillCategory {
  switch (slug) {
    case "house-cleaning":
      return "CLEANING";
    case "cooking":
      return "COOKING";
    case "child-care":
      return "CHILD_CARE";
    case "elderly-care":
      return "ELDERLY_CARE";
    case "driving":
      return "DRIVING";
    default:
      return "CLEANING";
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
