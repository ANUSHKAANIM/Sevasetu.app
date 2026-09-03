import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin Dashboard — SevaSetu" };

export default async function AdminDashboardPage() {
  await requireAdminContext();

  const [
    householdCount,
    helperCount,
    pendingVerifications,
    activeContracts,
    pendingJobRequests,
    overduePayments,
    openGrievances,
    openReplacements,
  ] = await Promise.all([
    prisma.householdProfile.count(),
    prisma.helperProfile.count(),
    prisma.helperProfile.count({ where: { identityVerification: "PENDING" } }),
    prisma.employmentContract.count({ where: { status: "ACTIVE" } }),
    prisma.jobRequest.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "OVERDUE" } }),
    prisma.grievance.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.replacementRequest.count({ where: { status: { in: ["OPEN", "MATCHING"] } } }),
  ]);

  const stats = [
    { label: "Households", value: householdCount, href: "/admin/users?role=HOUSEHOLD" },
    { label: "Helpers", value: helperCount, href: "/admin/users?role=HELPER" },
    { label: "Pending verifications", value: pendingVerifications, href: "/admin/verification" },
    { label: "Active contracts", value: activeContracts, href: "/admin/contracts" },
    { label: "Pending job requests", value: pendingJobRequests, href: "/admin/contracts" },
    { label: "Overdue payments", value: overduePayments, href: "/admin/payments" },
    { label: "Open grievances", value: openGrievances, href: "/admin/grievances" },
    { label: "Open replacement requests", value: openReplacements, href: "/admin/replacements" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide operations overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <p className="font-serif text-3xl font-semibold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Attention needed</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {pendingVerifications > 0 && (
            <p>
              <Badge variant="warning" className="mr-2">Action</Badge>
              {pendingVerifications} helper(s) awaiting verification review.
            </p>
          )}
          {openGrievances > 0 && (
            <p>
              <Badge variant="warning" className="mr-2">Action</Badge>
              {openGrievances} grievance(s) need a response.
            </p>
          )}
          {overduePayments > 0 && (
            <p>
              <Badge variant="destructive" className="mr-2">Attention</Badge>
              {overduePayments} payment(s) are overdue.
            </p>
          )}
          {pendingVerifications === 0 && openGrievances === 0 && overduePayments === 0 && (
            <p className="text-muted-foreground">Nothing urgent right now.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
