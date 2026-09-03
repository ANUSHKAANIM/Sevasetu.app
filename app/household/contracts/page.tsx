import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONTRACT_STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Contracts — SevaSetu" };

export default async function HouseholdContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ requestSent?: string }>;
}) {
  const { householdId } = await requireHouseholdContext();
  const { requestSent } = await searchParams;

  const [contracts, pendingRequests] = await Promise.all([
    prisma.employmentContract.findMany({
      where: { householdId },
      include: { helper: { include: { user: true } }, serviceCategory: true, salaryCalculation: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobRequest.findMany({
      where: { householdId, status: "PENDING" },
      include: { helper: { include: { user: true } }, serviceCategory: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Contracts &amp; job requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Digital employment agreements with your service professionals.
        </p>
      </div>

      {requestSent && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Your hiring request has been sent. You&apos;ll be notified once the professional responds.
        </p>
      )}

      {pendingRequests.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-3 text-sm font-medium">Pending job requests</p>
            <div className="divide-y divide-border">
              {pendingRequests.map((jr) => (
                <div key={jr.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{jr.helper.user.name} · {jr.serviceCategory.name}</span>
                  <Badge variant="outline">Awaiting response</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {contracts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No contracts yet.</p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/household/search">Find a helper</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contracts.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.helper.user.name}</p>
                    <p className="text-sm text-muted-foreground">{c.serviceCategory.name}</p>
                  </div>
                  <Badge variant={c.status === "ACTIVE" ? "success" : "outline"}>
                    {CONTRACT_STATUS_LABEL[c.status]}
                  </Badge>
                </div>
                <p className="mt-3 text-sm">
                  ₹{Number(c.salaryCalculation.totalPayment).toLocaleString("en-IN")}/month
                </p>
                <p className="text-xs text-muted-foreground">
                  Since {c.startDate.toLocaleDateString("en-IN")}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href={`/household/contracts/${c.id}`}>View contract</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
