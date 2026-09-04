import type { Metadata } from "next";
import { IndianRupee, ShieldPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { summarizeBalance } from "@/services/leave-service";

export const metadata: Metadata = { title: "My Money — SevaSetu" };

const BENEFIT_LABEL: Record<string, string> = {
  PF: "Provident Fund (savings)",
  ESI: "Health Insurance (ESI)",
  PAID_LEAVE: "Paid Leave",
  HEALTH_INSURANCE: "Health Insurance",
  SAVINGS: "Savings",
  EMERGENCY_LOAN: "Emergency Loan",
};

export default async function HelperMoneyPage() {
  const { helperId } = await requireHelperContext();

  const [payments, contributions, insuranceEnrollments, contracts] = await Promise.all([
    prisma.payment.findMany({
      where: { helperId },
      include: { household: { include: { user: true } } },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    }),
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
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-semibold">My Money</h1>
        <p className="mt-1 text-lg text-muted-foreground">Your payments and other benefits.</p>
        <Badge variant="outline" className="mt-2">Demo — no real money moves yet</Badge>
      </div>

      <Section icon={IndianRupee} title="Payments">
        {payments.length === 0 ? (
          <EmptyNote>No payments yet.</EmptyNote>
        ) : (
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{p.household.user.name}</p>
                  <p className="text-muted-foreground">{p.periodMonth}/{p.periodYear}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">₹{Number(p.workerSalary).toLocaleString("en-IN")}</p>
                  <Badge variant={p.status === "PAID" ? "success" : "warning"}>
                    {p.status === "PAID" ? "Paid" : p.status === "OVERDUE" ? "Late" : "Not paid yet"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon={ShieldPlus} title="My Benefits">
        <Badge variant="outline" className="mb-4">Demo — not yet connected to a real provider</Badge>

        {contracts.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {contracts.map((c) => {
              const summary = c.leaveBalance ? summarizeBalance(c.leaveBalance) : null;
              return summary ? (
                <Card key={c.id}>
                  <CardContent className="pt-6 text-sm">
                    <p>Days off left: {summary.annualRemaining}</p>
                    <p>Sick days left: {summary.sickRemaining}</p>
                  </CardContent>
                </Card>
              ) : null;
            })}
          </div>
        )}

        {contributions.length > 0 && (
          <div className="mb-4 divide-y divide-border rounded-lg border border-border px-4">
            {contributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span>{BENEFIT_LABEL[c.benefitType]} · {c.month}/{c.year}</span>
                <span>
                  ₹{(Number(c.employeeAmount) + Number(c.employerAmount)).toLocaleString("en-IN")} saved
                </span>
              </div>
            ))}
          </div>
        )}

        {insuranceEnrollments.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
            <span>{i.policyType}</span>
            <Badge variant={i.status === "ACTIVE" ? "success" : "outline"}>
              {i.status === "ACTIVE" ? "Active" : "Not started"}
            </Badge>
          </div>
        ))}
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
