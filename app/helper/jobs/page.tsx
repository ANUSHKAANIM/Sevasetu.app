import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scoreHelperMatch } from "@/services/matching-service";
import { acceptJobRequestAction, declineJobRequestAction } from "@/app/actions/job-actions";

export const metadata: Metadata = { title: "Job Matches — SevaSetu" };

export default async function HelperJobsPage() {
  const { helperId } = await requireHelperContext();

  const helper = await prisma.helperProfile.findUniqueOrThrow({ where: { id: helperId } });

  const jobRequests = await prisma.jobRequest.findMany({
    where: { helperId },
    include: {
      household: { include: { user: true } },
      serviceCategory: true,
      salaryCalculation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Job matches</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hiring requests from households, ranked by a transparent match score.
        </p>
      </div>

      {jobRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No job requests yet. Complete your profile and skill assessments to attract more matches.
        </p>
      ) : (
        <div className="space-y-3">
          {jobRequests.map((jr) => {
            const match = scoreHelperMatch(
              {
                serviceCategoryId: jr.serviceCategoryId,
                locationTier: jr.household.locationTier,
                employmentType: jr.salaryCalculation?.employmentType ?? "FULL_TIME",
                minSkillTier: helper.skillTier,
              },
              {
                helperId: helper.id,
                offersService: true,
                locationTier: helper.locationTier,
                skillTier: helper.skillTier,
                employmentTypePref: helper.employmentTypePref,
                experienceYears: helper.experienceYears,
              }
            );

            return (
              <Card key={jr.id}>
                <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{jr.household.user.name}</p>
                      <Badge variant="accent">{match.score}% Match</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {jr.serviceCategory.name} · {jr.household.city}
                    </p>
                    {jr.salaryCalculation && (
                      <p className="mt-1 text-sm font-medium">
                        ₹{Number(jr.salaryCalculation.workerSalary).toLocaleString("en-IN")}/mo
                      </p>
                    )}
                    {jr.message && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{jr.message}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {jr.status === "PENDING" ? (
                      <>
                        <form action={async () => { "use server"; await acceptJobRequestAction(jr.id); }}>
                          <Button size="sm">Accept</Button>
                        </form>
                        <form action={async () => { "use server"; await declineJobRequestAction(jr.id); }}>
                          <Button size="sm" variant="outline">Decline</Button>
                        </form>
                      </>
                    ) : (
                      <Badge variant={jr.status === "CONVERTED" ? "success" : "outline"}>{jr.status}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Match score = service fit (35%) + location fit (25%) + skill tier fit (20%) + availability
        fit (10%) + experience (10%). It is a simple, documented weighting — not a machine-learning
        prediction.
      </p>
    </div>
  );
}
