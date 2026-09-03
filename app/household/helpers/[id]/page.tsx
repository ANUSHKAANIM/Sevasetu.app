import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  SKILL_TIER_LABEL,
  EMPLOYMENT_TYPE_LABEL,
  VERIFICATION_STATUS_LABEL,
} from "@/lib/constants";

export const metadata: Metadata = { title: "Helper Profile — SevaSetu" };

export default async function HelperProfilePage({
  params,
}: PageProps<"/household/helpers/[id]">) {
  await requireHouseholdContext();
  const { id } = await params;

  const helper = await prisma.helperProfile.findUnique({
    where: { id },
    include: {
      user: true,
      helperServices: { include: { serviceCategory: true } },
      helperSkills: { include: { skill: true } },
      trainingEnrollments: { include: { course: true }, where: { status: "COMPLETED" } },
      skillAssessments: { orderBy: { assessedAt: "desc" }, take: 3 },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!helper) notFound();

  const avgRating =
    helper.reviews.length > 0
      ? helper.reviews.reduce((sum, r) => sum + r.rating, 0) / helper.reviews.length
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <PersonAvatar id={helper.id} name={helper.user.name} size="lg" />
            <div>
              <h1 className="font-serif text-2xl font-semibold">{helper.user.name}</h1>
              <p className="text-sm text-muted-foreground">
                {helper.city} · {helper.experienceYears} yrs experience
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant={helper.identityVerification === "VERIFIED" ? "success" : "outline"}>
                  {VERIFICATION_STATUS_LABEL[helper.identityVerification]}
                </Badge>
                <Badge variant="secondary">{SKILL_TIER_LABEL[helper.skillTier]} tier</Badge>
                {avgRating && <Badge variant="accent">★ {avgRating.toFixed(1)} ({helper.reviews.length})</Badge>}
              </div>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href={`/household/hire/${helper.id}`}>Start hiring</Link>
          </Button>
        </CardContent>
      </Card>

      {helper.bio && (
        <Card>
          <CardHeader><CardTitle>About</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{helper.bio}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Services offered</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {helper.helperServices.map((hs) => (
            <Badge key={hs.id} variant="secondary">
              {hs.serviceCategory.name} · {hs.yearsExperience} yrs
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {helper.helperSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not yet recorded.</p>
            ) : (
              helper.helperSkills.map((hs) => (
                <Badge key={hs.id} variant="outline">
                  {hs.skill.name} ({SKILL_TIER_LABEL[hs.level]})
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {helper.employmentTypePref.map((t) => (
              <Badge key={t} variant="outline">
                {EMPLOYMENT_TYPE_LABEL[t]}
              </Badge>
            ))}
            {helper.languages.length > 0 && (
              <p className="mt-2 w-full text-sm text-muted-foreground">
                Languages: {helper.languages.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Training certifications</CardTitle></CardHeader>
        <CardContent>
          {helper.trainingEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed courses yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {helper.trainingEnrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between">
                  <span>{e.course.title}</span>
                  <span className="text-muted-foreground">
                    Certified {e.completedAt?.toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
        <CardContent>
          {helper.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {helper.reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm font-medium">★ {r.rating}/5</p>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
