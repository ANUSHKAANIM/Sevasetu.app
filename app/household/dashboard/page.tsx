import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABEL, CONTRACT_STATUS_LABEL } from "@/lib/constants";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, IndianRupee, Plane } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — SevaSetu Household" };

export default async function HouseholdDashboardPage() {
  const { householdId } = await requireHouseholdContext();

  const [activeContracts, upcomingPayments, pendingLeaveRequests, openReplacements] =
    await Promise.all([
      prisma.employmentContract.findMany({
        where: { householdId, status: "ACTIVE" },
        include: {
          helper: { include: { user: true } },
          serviceCategory: true,
          salaryCalculation: true,
        },
      }),
      prisma.payment.findMany({
        where: { householdId, status: { in: ["PENDING", "PROCESSING", "OVERDUE"] } },
        include: { helper: { include: { user: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.leaveRequest.findMany({
        where: { status: "PENDING", contract: { householdId } },
        include: { contract: { include: { helper: { include: { user: true } } } } },
      }),
      prisma.replacementRequest.findMany({
        where: { householdId, status: { in: ["OPEN", "MATCHING"] } },
        include: { originalHelper: { include: { user: true } } },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Household dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of your active help, upcoming payments and pending approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active professionals" value={activeContracts.length} />
        <StatCard label="Payments due" value={upcomingPayments.length} />
        <StatCard label="Leave requests to review" value={pendingLeaveRequests.length} />
        <StatCard label="Open replacement requests" value={openReplacements.length} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active service professionals</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/household/search">Find more help</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeContracts.length === 0 ? (
            <EmptyState
              icon={Users}
              message="You don't have any active helpers yet."
              actionHref="/household/search"
              actionLabel="Search helpers"
            />
          ) : (
            <div className="divide-y divide-border">
              {activeContracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <PersonAvatar id={c.helper.id} name={c.helper.user.name} size="sm" />
                    <div>
                      <p className="font-medium">{c.helper.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.serviceCategory.name} · ₹
                        {Number(c.salaryCalculation.totalPayment).toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">{CONTRACT_STATUS_LABEL[c.status]}</Badge>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/household/contracts/${c.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming payments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <EmptyState icon={IndianRupee} message="No payments due right now." />
            ) : (
              <div className="divide-y divide-border">
                {upcomingPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{p.helper.user.name}</p>
                      <p className="text-muted-foreground">
                        Due {p.dueDate.toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₹{Number(p.totalAmount).toLocaleString("en-IN")}
                      </p>
                      <Badge variant="warning">{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild size="sm" variant="link" className="mt-2 px-0">
              <Link href="/household/payments">View all payments →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending leave requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLeaveRequests.length === 0 ? (
              <EmptyState icon={Plane} message="No leave requests waiting on you." />
            ) : (
              <div className="divide-y divide-border">
                {pendingLeaveRequests.map((lr) => (
                  <div key={lr.id} className="py-3 text-sm">
                    <p className="font-medium">{lr.contract.helper.user.name}</p>
                    <p className="text-muted-foreground">
                      {lr.leaveType} · {lr.startDate.toLocaleDateString("en-IN")}–
                      {lr.endDate.toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button asChild size="sm" variant="link" className="mt-2 px-0">
              <Link href="/household/leave">Review leave requests →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="font-serif text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

