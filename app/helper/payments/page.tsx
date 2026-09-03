import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Payments — SevaSetu" };

export default async function HelperPaymentsPage() {
  const { helperId } = await requireHelperContext();

  const payments = await prisma.payment.findMany({
    where: { helperId },
    include: { household: { include: { user: true } } },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Salary history, mediated through SevaSetu.
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
                <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.household.user.name}</p>
                    <p className="text-muted-foreground">{p.periodMonth}/{p.periodYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Number(p.workerSalary).toLocaleString("en-IN")}</p>
                    <Badge variant={p.status === "PAID" ? "success" : "warning"}>
                      {PAYMENT_STATUS_LABEL[p.status]}
                    </Badge>
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
