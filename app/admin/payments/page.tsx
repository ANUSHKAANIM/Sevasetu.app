import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABEL } from "@/lib/constants";
import type { PaymentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Payments — SevaSetu Admin" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminContext();
  const { status } = await searchParams;
  const filterStatus = status as PaymentStatus | undefined;

  const [counts, payments] = await Promise.all([
    prisma.payment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.payment.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      include: { household: { include: { user: true } }, helper: { include: { user: true } } },
      orderBy: { dueDate: "desc" },
      take: 50,
    }),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Payment management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All mediated payments across the platform.
        </p>
        <Badge variant="outline" className="mt-2">Demo payment flow — no real money moves</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant={!filterStatus ? "default" : "outline"}>
          <a href="/admin/payments">All ({payments.length >= 50 ? "50+" : payments.length})</a>
        </Button>
        {(["PENDING", "PROCESSING", "PAID", "FAILED", "OVERDUE"] as const).map((s) => (
          <Button key={s} asChild size="sm" variant={filterStatus === s ? "default" : "outline"}>
            <a href={`/admin/payments?status=${s}`}>
              {PAYMENT_STATUS_LABEL[s]} ({countByStatus[s] ?? 0})
            </a>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y divide-border pt-6">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p>{p.household.user.name} → {p.helper.user.name}</p>
                <p className="text-xs text-muted-foreground">{p.periodMonth}/{p.periodYear}</p>
              </div>
              <div className="text-right">
                <p>₹{Number(p.totalAmount).toLocaleString("en-IN")}</p>
                <Badge variant={p.status === "PAID" ? "success" : p.status === "OVERDUE" ? "destructive" : "warning"}>
                  {PAYMENT_STATUS_LABEL[p.status]}
                </Badge>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-muted-foreground">No payments found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
