import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { summarizeBalance } from "@/services/leave-service";

export const metadata: Metadata = { title: "Benefits — SevaSetu" };

const BENEFIT_LABEL: Record<string, string> = {
  PF: "Provident Fund (PF)",
  ESI: "Employees' State Insurance (ESI)",
  PAID_LEAVE: "Paid Leave",
  HEALTH_INSURANCE: "Health Insurance",
  SAVINGS: "Savings",
  EMERGENCY_LOAN: "Emergency Loan",
};

export default async function HelperBenefitsPage() {
  const { helperId } = await requireHelperContext();

  const [contributions, insuranceEnrollments, contracts] = await Promise.all([
    prisma.benefitContribution.findMany({
      where: { helperId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.insuranceEnrollment.findMany({ where: { helperId } }),
    prisma.employmentContract.findMany({
      where: { helperId, status: "ACTIVE" },
      include: { leaveBalance: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Benefits</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Social security and benefit records tracked by SevaSetu.
        </p>
        <Badge variant="outline" className="mt-2">
          Demo / Integration Pending — not connected to EPFO, ESIC or a live insurer
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Paid leave</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active contracts.</p>
          ) : (
            contracts.map((c) => {
              const summary = c.leaveBalance ? summarizeBalance(c.leaveBalance) : null;
              return summary ? (
                <div key={c.id} className="text-sm">
                  <p>Annual: {summary.annualRemaining}/{summary.annualTotal} remaining</p>
                  <p>Sick: {summary.sickRemaining}/{summary.sickTotal} remaining</p>
                </div>
              ) : null;
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contribution records</CardTitle></CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contribution records yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {contributions.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{BENEFIT_LABEL[c.benefitType]} · {c.month}/{c.year}</span>
                  <span>
                    ₹{Number(c.employeeAmount).toLocaleString("en-IN")} employee + ₹
                    {Number(c.employerAmount).toLocaleString("en-IN")} employer
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Insurance enrollment</CardTitle></CardHeader>
        <CardContent>
          {insuranceEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enrolled yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {insuranceEnrollments.map((i) => (
                <div key={i.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p>{i.policyType}</p>
                    <p className="text-xs text-muted-foreground">{i.provider}</p>
                  </div>
                  <Badge variant={i.status === "ACTIVE" ? "success" : "outline"}>{i.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Savings products</CardTitle></CardHeader>
        <CardContent>
          <Badge variant="outline">Demo / Integration Pending</Badge>
          <p className="mt-2 text-sm text-muted-foreground">
            Savings and emergency loan products are not yet connected to a real financial partner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
