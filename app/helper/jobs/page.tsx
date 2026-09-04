import type { Metadata } from "next";
import { Briefcase, CalendarCheck, Plane } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { scoreHelperMatch } from "@/services/matching-service";
import { summarizeBalance } from "@/services/leave-service";
import { acceptJobRequestAction, declineJobRequestAction } from "@/app/actions/job-actions";
import { LeaveRequestForm } from "@/components/helper/leave-request-form";

export const metadata: Metadata = { title: "My Jobs — SevaSetu" };

export default async function HelperJobsPage() {
  const { helperId } = await requireHelperContext();

  const helper = await prisma.helperProfile.findUniqueOrThrow({ where: { id: helperId } });

  const [jobRequests, activeContracts, attendanceRecords, leaveRequests] = await Promise.all([
    prisma.jobRequest.findMany({
      where: { helperId, status: "PENDING" },
      include: { household: { include: { user: true } }, serviceCategory: true, salaryCalculation: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employmentContract.findMany({
      where: { helperId, status: "ACTIVE" },
      include: {
        household: { include: { user: true } },
        serviceCategory: true,
        salaryCalculation: true,
        leaveBalance: true,
      },
    }),
    prisma.attendanceRecord.findMany({
      where: { contract: { helperId } },
      include: { contract: { include: { household: { include: { user: true } } } } },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.leaveRequest.findMany({
      where: { contract: { helperId } },
      include: { contract: { include: { household: { include: { user: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">My Jobs</h1>
        <p className="mt-1 text-lg text-muted-foreground">
          New job offers, your current work, attendance and leave — all in one place.
        </p>
      </div>

      {/* ------------------------------------------------------------ */}
      <Section icon={Briefcase} title="New Job Offers">
        {jobRequests.length === 0 ? (
          <EmptyNote>No new job offers right now. Check back later!</EmptyNote>
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
                <Card key={jr.id} className="border-2 border-accent/40">
                  <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <PersonAvatar id={jr.household.id} name={jr.household.user.name} size="lg" />
                      <div>
                        <p className="text-lg font-semibold">{jr.household.user.name}</p>
                        <p className="text-muted-foreground">
                          {jr.serviceCategory.name} · {jr.household.city}
                        </p>
                        {jr.salaryCalculation && (
                          <p className="mt-1 text-lg font-semibold text-primary">
                            ₹{Number(jr.salaryCalculation.workerSalary).toLocaleString("en-IN")}/month
                          </p>
                        )}
                        <Badge variant="accent" className="mt-1">{match.score}% good fit for you</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={async () => { "use server"; await acceptJobRequestAction(jr.id); }}>
                        <Button size="lg">Accept</Button>
                      </form>
                      <form action={async () => { "use server"; await declineJobRequestAction(jr.id); }}>
                        <Button size="lg" variant="outline">No thanks</Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------ */}
      <Section icon={Briefcase} title="My Current Work">
        {activeContracts.length === 0 ? (
          <EmptyNote>You don&apos;t have any active work yet.</EmptyNote>
        ) : (
          <div className="space-y-4">
            {activeContracts.map((c) => {
              const leave = c.leaveBalance ? summarizeBalance(c.leaveBalance) : null;
              return (
                <Card key={c.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PersonAvatar id={c.household.id} name={c.household.user.name} size="md" />
                        <div>
                          <p className="text-lg font-medium">{c.household.user.name}</p>
                          <p className="text-muted-foreground">{c.serviceCategory.name}</p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-primary">
                        ₹{Number(c.salaryCalculation.totalPayment).toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                    {leave && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Days off left this year: {leave.annualRemaining} · Sick days left: {leave.sickRemaining}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------ */}
      <Section icon={CalendarCheck} title="My Attendance">
        <p className="mb-3 text-muted-foreground">
          Your household marks each day you come to work. If something looks wrong, go to{" "}
          <span className="font-medium text-foreground">Get Help</span>.
        </p>
        {attendanceRecords.length === 0 ? (
          <EmptyNote>No attendance marked yet.</EmptyNote>
        ) : (
          <div className="divide-y divide-border">
            {attendanceRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2">
                <span>{r.contract.household.user.name}</span>
                <span className="text-muted-foreground">{r.date.toLocaleDateString("en-IN")}</span>
                <Badge
                  variant={
                    r.status === "PRESENT" ? "success" : r.status === "ABSENT" ? "destructive" : "outline"
                  }
                >
                  {r.status === "PRESENT"
                    ? "Present"
                    : r.status === "ABSENT"
                      ? "Absent"
                      : r.status === "HALF_DAY"
                        ? "Half day"
                        : "Leave"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------ */}
      <Section icon={Plane} title="My Leave">
        {activeContracts.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeContracts.map((c) => {
              const summary = c.leaveBalance ? summarizeBalance(c.leaveBalance) : null;
              return (
                <Card key={c.id}>
                  <CardContent className="pt-6">
                    <p className="font-medium">{c.household.user.name}</p>
                    {summary && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Days off left: {summary.annualRemaining} · Sick days left: {summary.sickRemaining}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Ask for leave</CardTitle></CardHeader>
          <CardContent>
            <LeaveRequestForm
              contracts={activeContracts.map((c) => ({ id: c.id, label: c.household.user.name }))}
            />
          </CardContent>
        </Card>

        {leaveRequests.length > 0 && (
          <div className="mt-4 divide-y divide-border rounded-lg border border-border px-4">
            {leaveRequests.map((lr) => (
              <div key={lr.id} className="flex items-center justify-between py-3">
                <span>
                  {lr.leaveType === "SICK" ? "Sick" : lr.leaveType === "ANNUAL" ? "Day off" : "Unpaid"} ·{" "}
                  {lr.startDate.toLocaleDateString("en-IN")}–{lr.endDate.toLocaleDateString("en-IN")}
                </span>
                <Badge variant={lr.status === "APPROVED" ? "success" : lr.status === "REJECTED" ? "destructive" : "outline"}>
                  {lr.status === "APPROVED" ? "Approved" : lr.status === "REJECTED" ? "Not approved" : "Waiting"}
                </Badge>
              </div>
            ))}
          </div>
        )}
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

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}
