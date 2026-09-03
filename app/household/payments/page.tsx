import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABEL } from "@/lib/constants";
import { confirmPaymentAction } from "@/app/actions/payment-actions";

export const metadata: Metadata = { title: "Payments — SevaSetu" };

export default async function HouseholdPaymentsPage() {
  const { householdId } = await requireHouseholdContext();

  const payments = await prisma.payment.findMany({
    where: { householdId },
    include: { helper: { include: { user: true } } },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monthly payments are mediated by SevaSetu rather than paid directly to helpers.
        </p>
        <Badge variant="outline" className="mt-2">Demo payment flow — no real money moves</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Payment history</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{p.helper.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.periodMonth}/{p.periodYear} · Due {p.dueDate.toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="font-medium">₹{Number(p.totalAmount).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">
                        Worker ₹{Number(p.workerSalary).toLocaleString("en-IN")} + fee ₹
                        {Number(p.platformFee).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        p.status === "PAID" ? "success" : p.status === "OVERDUE" ? "destructive" : "warning"
                      }
                    >
                      {PAYMENT_STATUS_LABEL[p.status]}
                    </Badge>
                    {p.status !== "PAID" && (
                      <form action={async () => { "use server"; await confirmPaymentAction(p.id); }}>
                        <Button size="sm">Pay now</Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
