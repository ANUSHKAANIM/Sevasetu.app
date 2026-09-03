import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Jobs & Contracts — SevaSetu Admin" };

export default async function AdminContractsPage() {
  await requireAdminContext();

  const [jobRequests, contracts] = await Promise.all([
    prisma.jobRequest.findMany({
      where: { status: "PENDING" },
      include: { household: { include: { user: true } }, helper: { include: { user: true } }, serviceCategory: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.employmentContract.findMany({
      include: { household: { include: { user: true } }, helper: { include: { user: true } }, serviceCategory: true, salaryCalculation: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Jobs &amp; contracts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pending job requests and all employment contracts across the platform.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Pending job requests</CardTitle></CardHeader>
        <CardContent>
          {jobRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending job requests.</p>
          ) : (
            <div className="divide-y divide-border">
              {jobRequests.map((jr) => (
                <div key={jr.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{jr.household.user.name} → {jr.helper.user.name}</span>
                  <span className="text-muted-foreground">{jr.serviceCategory.name}</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All contracts</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {contracts.map((c) => (
              <div key={c.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{c.household.user.name} → {c.helper.user.name}</p>
                  <p className="text-muted-foreground">{c.serviceCategory.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span>₹{Number(c.salaryCalculation.totalPayment).toLocaleString("en-IN")}/mo</span>
                  <Badge variant={c.status === "ACTIVE" ? "success" : "outline"}>
                    {CONTRACT_STATUS_LABEL[c.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
