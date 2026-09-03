import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveLeaveRequestAction, rejectLeaveRequestAction } from "@/app/actions/leave-actions";

export const metadata: Metadata = { title: "Leave Requests — SevaSetu" };

export default async function HouseholdLeavePage() {
  const { householdId } = await requireHouseholdContext();

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { contract: { householdId } },
    include: { contract: { include: { helper: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Leave requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and respond to leave requests from your helpers.
        </p>
      </div>

      {leaveRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leave requests yet.</p>
      ) : (
        <div className="space-y-3">
          {leaveRequests.map((lr) => (
            <Card key={lr.id}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{lr.contract.helper.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lr.leaveType} leave · {lr.startDate.toLocaleDateString("en-IN")}–
                    {lr.endDate.toLocaleDateString("en-IN")}
                  </p>
                  <p className="mt-1 text-sm">{lr.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lr.status === "PENDING" ? (
                    <>
                      <form action={async () => { "use server"; await approveLeaveRequestAction(lr.id); }}>
                        <Button size="sm">Approve</Button>
                      </form>
                      <form action={async () => { "use server"; await rejectLeaveRequestAction(lr.id); }}>
                        <Button size="sm" variant="outline">Reject</Button>
                      </form>
                    </>
                  ) : (
                    <Badge variant={lr.status === "APPROVED" ? "success" : "destructive"}>
                      {lr.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
