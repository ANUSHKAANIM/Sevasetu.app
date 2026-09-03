-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HOUSEHOLD', 'HELPER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SkillTier" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PART_TIME_2H', 'PART_TIME_4H', 'PART_TIME_8H', 'FULL_TIME', 'LIVE_IN');

-- CreateEnum
CREATE TYPE "ScopeOfWork" AS ENUM ('BASIC', 'STANDARD', 'EXTENDED');

-- CreateEnum
CREATE TYPE "LocationTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('CLEANING', 'COOKING', 'CHILD_CARE', 'ELDERLY_CARE', 'DRIVING');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "JobRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'ANNUAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('PF', 'ESI', 'PAID_LEAVE', 'HEALTH_INSURANCE', 'SAVINGS', 'EMERGENCY_LOAN');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('NOT_ENROLLED', 'PENDING', 'ACTIVE', 'LAPSED');

-- CreateEnum
CREATE TYPE "ReplacementType" AS ENUM ('TEMPORARY', 'PERMANENT');

-- CreateEnum
CREATE TYPE "ReplacementStatus" AS ENUM ('OPEN', 'MATCHING', 'MATCHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "GrievanceCategory" AS ENUM ('PAYMENT_ISSUE', 'WORKPLACE_CONCERN', 'ATTENDANCE_DISPUTE', 'LEAVE_DISPUTE', 'OTHER');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOB_MATCH', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'PAYMENT_DUE', 'PAYMENT_COMPLETED', 'REPLACEMENT_FOUND', 'VERIFICATION_UPDATED', 'GRIEVANCE_RESPONSE', 'CONTRACT_UPDATE', 'GENERAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addressLine" TEXT,
    "city" TEXT NOT NULL,
    "locationTier" "LocationTier" NOT NULL,
    "familySize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelperProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "gender" TEXT,
    "city" TEXT NOT NULL,
    "locationTier" "LocationTier" NOT NULL,
    "languages" TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "skillTier" "SkillTier" NOT NULL DEFAULT 'BASIC',
    "employmentTypePref" "EmploymentType"[],
    "availableFrom" TIMESTAMP(3),
    "identityVerification" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "addressVerification" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "referenceVerification" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "backgroundCheck" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelperProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelperService" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelperService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelperSkill" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" "SkillTier" NOT NULL DEFAULT 'BASIC',
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelperSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCourse" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingEnrollment" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "TrainingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "certificateRef" TEXT,

    CONSTRAINT "TrainingEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillAssessment" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "assessorName" TEXT NOT NULL,
    "result" "SkillTier" NOT NULL,
    "notes" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRule" (
    "id" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "locationTier" "LocationTier" NOT NULL,
    "skillTier" "SkillTier" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "scopeOfWork" "ScopeOfWork" NOT NULL,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "skillAdjustmentPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "scopeAdjustmentPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "platformFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryCalculation" (
    "id" TEXT NOT NULL,
    "salaryRuleId" TEXT,
    "householdId" TEXT,
    "helperId" TEXT,
    "serviceCategoryId" TEXT NOT NULL,
    "locationTier" "LocationTier" NOT NULL,
    "skillTier" "SkillTier" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "scopeOfWork" "ScopeOfWork" NOT NULL,
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "skillAdjustment" DECIMAL(10,2) NOT NULL,
    "scopeAdjustment" DECIMAL(10,2) NOT NULL,
    "workerSalary" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "totalPayment" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryCalculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequest" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "salaryCalculationId" TEXT,
    "status" "JobRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "workSchedule" JSONB,
    "responsibilities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentContract" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,
    "jobRequestId" TEXT,
    "salaryCalculationId" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "workSchedule" JSONB NOT NULL,
    "leavePolicy" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "markedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sickTotal" INTEGER NOT NULL DEFAULT 12,
    "sickUsed" INTEGER NOT NULL DEFAULT 0,
    "annualTotal" INTEGER NOT NULL DEFAULT 15,
    "annualUsed" INTEGER NOT NULL DEFAULT 0,
    "unpaidUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "dueDayOfMonth" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "paymentScheduleId" TEXT,
    "householdId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "workerSalary" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" DATE NOT NULL,
    "paidAt" TIMESTAMP(3),
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitContribution" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "benefitType" "BenefitType" NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "employeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "employerAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenefitContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceEnrollment" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "policyType" TEXT NOT NULL,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'NOT_ENROLLED',
    "enrolledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementRequest" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "originalHelperId" TEXT NOT NULL,
    "matchedHelperId" TEXT,
    "type" "ReplacementType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReplacementStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplacementRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "contractId" TEXT,
    "category" "GrievanceCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrievanceMessage" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternalNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrievanceMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdProfile_userId_key" ON "HouseholdProfile"("userId");

-- CreateIndex
CREATE INDEX "HouseholdProfile_city_idx" ON "HouseholdProfile"("city");

-- CreateIndex
CREATE UNIQUE INDEX "HelperProfile_userId_key" ON "HelperProfile"("userId");

-- CreateIndex
CREATE INDEX "HelperProfile_city_idx" ON "HelperProfile"("city");

-- CreateIndex
CREATE INDEX "HelperProfile_skillTier_idx" ON "HelperProfile"("skillTier");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_name_key" ON "ServiceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HelperService_helperId_serviceCategoryId_key" ON "HelperService"("helperId", "serviceCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_category_key" ON "Skill"("name", "category");

-- CreateIndex
CREATE UNIQUE INDEX "HelperSkill_helperId_skillId_key" ON "HelperSkill"("helperId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingEnrollment_helperId_courseId_key" ON "TrainingEnrollment"("helperId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryRule_serviceCategoryId_locationTier_skillTier_employm_key" ON "SalaryRule"("serviceCategoryId", "locationTier", "skillTier", "employmentType", "scopeOfWork");

-- CreateIndex
CREATE INDEX "JobRequest_householdId_idx" ON "JobRequest"("householdId");

-- CreateIndex
CREATE INDEX "JobRequest_helperId_idx" ON "JobRequest"("helperId");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentContract_jobRequestId_key" ON "EmploymentContract"("jobRequestId");

-- CreateIndex
CREATE INDEX "EmploymentContract_householdId_idx" ON "EmploymentContract"("householdId");

-- CreateIndex
CREATE INDEX "EmploymentContract_helperId_idx" ON "EmploymentContract"("helperId");

-- CreateIndex
CREATE INDEX "EmploymentContract_status_idx" ON "EmploymentContract"("status");

-- CreateIndex
CREATE INDEX "AttendanceRecord_contractId_idx" ON "AttendanceRecord"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_contractId_date_key" ON "AttendanceRecord"("contractId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_contractId_key" ON "LeaveBalance"("contractId");

-- CreateIndex
CREATE INDEX "LeaveRequest_contractId_idx" ON "LeaveRequest"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSchedule_contractId_key" ON "PaymentSchedule"("contractId");

-- CreateIndex
CREATE INDEX "Payment_householdId_idx" ON "Payment"("householdId");

-- CreateIndex
CREATE INDEX "Payment_helperId_idx" ON "Payment"("helperId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_contractId_periodMonth_periodYear_key" ON "Payment"("contractId", "periodMonth", "periodYear");

-- CreateIndex
CREATE UNIQUE INDEX "BenefitContribution_helperId_benefitType_month_year_key" ON "BenefitContribution"("helperId", "benefitType", "month", "year");

-- CreateIndex
CREATE INDEX "Review_helperId_idx" ON "Review"("helperId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_contractId_key" ON "Review"("contractId");

-- CreateIndex
CREATE INDEX "Grievance_raisedById_idx" ON "Grievance"("raisedById");

-- CreateIndex
CREATE INDEX "Grievance_status_idx" ON "Grievance"("status");

-- CreateIndex
CREATE INDEX "GrievanceMessage_grievanceId_idx" ON "GrievanceMessage"("grievanceId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "HouseholdProfile" ADD CONSTRAINT "HouseholdProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelperProfile" ADD CONSTRAINT "HelperProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelperService" ADD CONSTRAINT "HelperService_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelperService" ADD CONSTRAINT "HelperService_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelperSkill" ADD CONSTRAINT "HelperSkill_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelperSkill" ADD CONSTRAINT "HelperSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TrainingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssessment" ADD CONSTRAINT "SkillAssessment_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRule" ADD CONSTRAINT "SalaryRule_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryCalculation" ADD CONSTRAINT "SalaryCalculation_salaryRuleId_fkey" FOREIGN KEY ("salaryRuleId") REFERENCES "SalaryRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryCalculation" ADD CONSTRAINT "SalaryCalculation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "HouseholdProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryCalculation" ADD CONSTRAINT "SalaryCalculation_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryCalculation" ADD CONSTRAINT "SalaryCalculation_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "HouseholdProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequest" ADD CONSTRAINT "JobRequest_salaryCalculationId_fkey" FOREIGN KEY ("salaryCalculationId") REFERENCES "SalaryCalculation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContract" ADD CONSTRAINT "EmploymentContract_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "HouseholdProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContract" ADD CONSTRAINT "EmploymentContract_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContract" ADD CONSTRAINT "EmploymentContract_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContract" ADD CONSTRAINT "EmploymentContract_jobRequestId_fkey" FOREIGN KEY ("jobRequestId") REFERENCES "JobRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentContract" ADD CONSTRAINT "EmploymentContract_salaryCalculationId_fkey" FOREIGN KEY ("salaryCalculationId") REFERENCES "SalaryCalculation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "HouseholdProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "HouseholdProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentScheduleId_fkey" FOREIGN KEY ("paymentScheduleId") REFERENCES "PaymentSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "HouseholdProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitContribution" ADD CONSTRAINT "BenefitContribution_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceEnrollment" ADD CONSTRAINT "InsuranceEnrollment_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequest" ADD CONSTRAINT "ReplacementRequest_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequest" ADD CONSTRAINT "ReplacementRequest_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "HouseholdProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequest" ADD CONSTRAINT "ReplacementRequest_originalHelperId_fkey" FOREIGN KEY ("originalHelperId") REFERENCES "HelperProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementRequest" ADD CONSTRAINT "ReplacementRequest_matchedHelperId_fkey" FOREIGN KEY ("matchedHelperId") REFERENCES "HelperProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "HouseholdProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "HelperProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "EmploymentContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceMessage" ADD CONSTRAINT "GrievanceMessage_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceMessage" ADD CONSTRAINT "GrievanceMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
