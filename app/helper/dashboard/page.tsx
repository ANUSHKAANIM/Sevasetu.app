import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SKILL_TIER_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/constants";
import { summarizeBalance } from "@/services/leave-service";
import { PersonAvatar } from "@/components/shared/person-avatar";

export const metadata: Metadata = { title: "Dashboard — SevaSetu Helper" };

export default async function HelperDashboardPage() {
  const { helperId } = await requireHelperContext();

  const helper = await prisma.helperProfile.findUniqueOrThrow({
    where: { id: helperId },
    include: {
      helperServices: true,
      trainingEnrollments: true,
    },
  });

  const [activeContracts, upcomingPayment, pendingJobRequests, openJobRequests] =
    await Promise.all([
      prisma.employmentContract.findMany({
        where: { helperId, status: "ACTIVE" },
        include: {
          household: { include: { user: true } },
          serviceCategory: true,
          salaryCalculation: true,
          leaveBalance: true,
        },
      }),
      prisma.payment.findFirst({
        where: { helperId, status: { in: ["PENDING", "PROCESSING"] } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.jobRequest.count({ where: { helperId, status: "PENDING" } }),
      prisma.jobRequest.findMany({
        where: { helperId, status: "PENDING" },
        include: { household: true, serviceCategory: true },
        take: 3,
      }),
    ]);

  const completedCourses = helper.trainingEnrollments.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s where things stand with your work on SevaSetu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="font-serif text-3xl font-semibold">{activeContracts.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Active employments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Badge variant="secondary" className="text-sm">{SKILL_TIER_LABEL[helper.skillTier]}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">Skill tier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-serif text-3xl font-semibold">{completedCourses}</p>
            <p className="mt-1 text-sm text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="font-serif text-3xl font-semibold">{pendingJobRequests}</p>
            <p className="mt-1 text-sm text-muted-foreground">Pending job requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={helper.profileCompleteness} />
          <p className="mt-2 text-sm text-muted-foreground">
            {helper.profileCompleteness}% complete.{" "}
            <Link href="/helper/profile" className="text-primary hover:underline">
              Update your profile
            </Link>{" "}
            to improve your match score with households.
          </p>
        </CardContent>
      </Card>

      {openJobRequests.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New job requests</CardTitle>
            <Button asChild size="sm" variant="outline"><Link href="/helper/jobs">View all</Link></Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {openJobRequests.map((jr) => (
              <div key={jr.id} className="flex items-center justify-between py-2 text-sm">
                <span>{jr.household.city} household · {jr.serviceCategory.name}</span>
                <Badge variant="outline">Pending your response</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Current employment</CardTitle></CardHeader>
        <CardContent>
          {activeContracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active employment yet. Complete your profile and skill assessments to improve your match score.
            </p>
          ) : (
            <div className="space-y-4">
              {activeContracts.map((c) => {
                const leave = c.leaveBalance ? summarizeBalance(c.leaveBalance) : null;
                return (
                  <div key={c.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PersonAvatar id={c.household.id} name={c.household.user.name} size="sm" />
                        <div>
                          <p className="font-medium">{c.household.user.name}</p>
                          <p className="text-sm text-muted-foreground">{c.serviceCategory.name}</p>
                        </div>
                      </div>
                      <p className="font-medium">
                        ₹{Number(c.salaryCalculation.totalPayment).toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                    {leave && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Annual leave: {leave.annualRemaining}/{leave.annualTotal} remaining · Sick leave:{" "}
                        {leave.sickRemaining}/{leave.sickTotal} remaining
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {upcomingPayment && (
        <Card>
          <CardHeader><CardTitle>Upcoming payment</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between text-sm">
            <span>Due {upcomingPayment.dueDate.toLocaleDateString("en-IN")}</span>
            <span className="font-medium">₹{Number(upcomingPayment.totalAmount).toLocaleString("en-IN")}</span>
            <Badge variant="warning">{PAYMENT_STATUS_LABEL[upcomingPayment.status]}</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
