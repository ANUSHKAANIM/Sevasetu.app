import type { Metadata } from "next";
import { UserCircle, Award, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelperProfileForm } from "@/components/helper/profile-form";
import { ServicesManager } from "@/components/helper/services-manager";
import { SKILL_TIER_LABEL } from "@/lib/constants";
import { enrollInCourseAction, advanceTrainingProgressAction } from "@/app/actions/training-actions";
import type { VerificationStatus } from "@prisma/client";

export const metadata: Metadata = { title: "My Profile — SevaSetu" };

const SIMPLE_VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  NOT_STARTED: "Not started yet",
  PENDING: "Being checked",
  VERIFIED: "Approved ✓",
  REJECTED: "Not approved",
};

export default async function HelperProfilePage() {
  const { helperId } = await requireHelperContext();

  const [helper, categories, courses, enrollments] = await Promise.all([
    prisma.helperProfile.findUniqueOrThrow({
      where: { id: helperId },
      include: {
        helperServices: { include: { serviceCategory: true } },
        helperSkills: { include: { skill: true } },
      },
    }),
    prisma.serviceCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingCourse.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.trainingEnrollment.findMany({ where: { helperId } }),
  ]);

  const enrollmentByCourseId = new Map(enrollments.map((e) => [e.courseId, e]));

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">My Profile</h1>
        <p className="mt-1 text-lg text-muted-foreground">Your details, skills and training.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="font-medium">Profile completeness</p>
          <Progress value={helper.profileCompleteness} className="mt-2" />
          <p className="mt-1 text-sm text-muted-foreground">{helper.profileCompleteness}% complete</p>
        </CardContent>
      </Card>

      <Section icon={UserCircle} title="My Details">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-3 font-medium">Approval status</p>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <VerificationRow label="Identity" status={helper.identityVerification} />
              <VerificationRow label="Address" status={helper.addressVerification} />
              <VerificationRow label="References" status={helper.referenceVerification} />
              <VerificationRow label="Background" status={helper.backgroundCheck} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <HelperProfileForm
              bio={helper.bio}
              city={helper.city}
              languages={helper.languages}
              experienceYears={helper.experienceYears}
              employmentTypePref={helper.employmentTypePref}
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <p className="mb-3 font-medium">Services I offer</p>
            <ServicesManager
              currentServices={helper.helperServices.map((hs) => ({
                id: hs.id,
                name: hs.serviceCategory.name,
                yearsExperience: hs.yearsExperience,
              }))}
              allCategories={categories}
            />
          </CardContent>
        </Card>
      </Section>

      <Section icon={Award} title="My Skill Level">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Your level</p>
            <Badge variant="secondary" className="mt-2 text-base">
              {SKILL_TIER_LABEL[helper.skillTier]}
            </Badge>
            {helper.helperSkills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {helper.helperSkills.map((hs) => (
                  <Badge key={hs.id} variant="outline">{hs.skill.name}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Section>

      <Section icon={GraduationCap} title="Training">
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => {
            const enrollment = enrollmentByCourseId.get(course.id);
            return (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.durationHours} hours</p>
                    </div>
                    {enrollment?.status === "COMPLETED" && <Badge variant="success">Done ✓</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>

                  {enrollment ? (
                    <div className="mt-4 space-y-2">
                      <Progress value={enrollment.progress} />
                      <p className="text-xs text-muted-foreground">{enrollment.progress}% done</p>
                      {enrollment.status !== "COMPLETED" && (
                        <form action={advanceTrainingProgressAction.bind(null, enrollment.id)}>
                          <Button size="sm" variant="outline">Continue</Button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <form action={enrollInCourseAction.bind(null, course.id)} className="mt-4">
                      <Button size="sm">Start course</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function VerificationRow({ label, status }: { label: string; status: VerificationStatus }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <Badge variant={status === "VERIFIED" ? "success" : status === "REJECTED" ? "destructive" : "outline"}>
        {SIMPLE_VERIFICATION_LABEL[status]}
      </Badge>
    </div>
  );
}
