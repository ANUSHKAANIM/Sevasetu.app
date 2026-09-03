import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaveRequestForm } from "@/components/helper/leave-request-form";
import { summarizeBalance } from "@/services/leave-service";

export const metadata: Metadata = { title: "Leave — SevaSetu" };

export default async function HelperLeavePage() {
  const { helperId } = await requireHelperContext();

  const contracts = await prisma.employmentContract.findMany({
    where: { helperId, status: "ACTIVE" },
    include: { household: { include: { user: true } }, leaveBalance: true },
  });

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { contract: { helperId } },
    include: { contract: { include: { household: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Leave</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit leave requests and track your balance across active contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {contracts.map((c) => {
          const summary = c.leaveBalance ? summarizeBalance(c.leaveBalance) : null;
          return (
            <Card key={c.id}>
              <CardContent className="pt-6 text-sm">
                <p className="font-medium">{c.household.user.name}</p>
                {summary && (
                  <p className="mt-1 text-muted-foreground">
                    Annual: {summary.annualRemaining}/{summary.annualTotal} · Sick:{" "}
                    {summary.sickRemaining}/{summary.sickTotal}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Request leave</CardTitle></CardHeader>
        <CardContent>
          <LeaveRequestForm
            contracts={contracts.map((c) => ({ id: c.id, label: c.household.user.name }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your leave requests</CardTitle></CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {leaveRequests.map((lr) => (
                <div key={lr.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {lr.leaveType} · {lr.startDate.toLocaleDateString("en-IN")}–{lr.endDate.toLocaleDateString("en-IN")}
                  </span>
                  <Badge variant={lr.status === "APPROVED" ? "success" : lr.status === "REJECTED" ? "destructive" : "outline"}>
                    {lr.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
