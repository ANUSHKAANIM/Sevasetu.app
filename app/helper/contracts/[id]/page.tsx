import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { assertCanAccessOwnRecord } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_STATUS_LABEL } from "@/lib/constants";
import { summarizeBalance } from "@/services/leave-service";

export const metadata: Metadata = { title: "Contract — SevaSetu" };

export default async function HelperContractDetailPage({
  params,
}: PageProps<"/helper/contracts/[id]">) {
  const { session } = await requireHelperContext();
  const { id } = await params;

  const contract = await prisma.employmentContract.findUnique({
    where: { id },
    include: {
      helper: true,
      household: { include: { user: true } },
      serviceCategory: true,
      salaryCalculation: true,
      leaveBalance: true,
    },
  });
  if (!contract) notFound();
  assertCanAccessOwnRecord(session, contract.helper.userId);

  const schedule = contract.workSchedule as { days: string[]; startTime: string; endTime: string };
  const leaveSummary = contract.leaveBalance ? summarizeBalance(contract.leaveBalance) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            Employment with {contract.household.user.name}
          </h1>
          <p className="text-sm text-muted-foreground">{contract.serviceCategory.name}</p>
        </div>
        <Badge variant={contract.status === "ACTIVE" ? "success" : "outline"}>
          {CONTRACT_STATUS_LABEL[contract.status]}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Terms</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Start date:</span> {contract.startDate.toLocaleDateString("en-IN")}</p>
          <p><span className="font-medium">Schedule:</span> {schedule.days?.join(", ")}, {schedule.startTime}–{schedule.endTime}</p>
          <div>
            <p className="font-medium">Responsibilities</p>
            <ul className="ml-5 list-disc text-muted-foreground">
              {contract.responsibilities.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your salary</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Base salary: ₹{Number(contract.salaryCalculation.baseSalary).toLocaleString("en-IN")}</p>
          <p>Skill adjustment: ₹{Number(contract.salaryCalculation.skillAdjustment).toLocaleString("en-IN")}</p>
          <p>Scope adjustment: ₹{Number(contract.salaryCalculation.scopeAdjustment).toLocaleString("en-IN")}</p>
          <p className="font-medium">
            Your monthly salary: ₹{Number(contract.salaryCalculation.workerSalary).toLocaleString("en-IN")}
          </p>
        </CardContent>
      </Card>

      {leaveSummary && (
        <Card>
          <CardHeader><CardTitle>Leave balance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-lg font-semibold">{leaveSummary.annualRemaining}/{leaveSummary.annualTotal}</p><p className="text-muted-foreground">Annual remaining</p></div>
            <div><p className="text-lg font-semibold">{leaveSummary.sickRemaining}/{leaveSummary.sickTotal}</p><p className="text-muted-foreground">Sick remaining</p></div>
            <div><p className="text-lg font-semibold">{leaveSummary.unpaidUsed}</p><p className="text-muted-foreground">Unpaid days taken</p></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
