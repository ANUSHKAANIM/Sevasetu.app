import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReplacementRequestForm } from "@/components/household/replacement-request-form";

export const metadata: Metadata = { title: "Replacement Requests — SevaSetu" };

export default async function HouseholdReplacementPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string }>;
}) {
  const { householdId } = await requireHouseholdContext();
  const { contractId } = await searchParams;

  const [contracts, requests] = await Promise.all([
    prisma.employmentContract.findMany({
      where: { householdId, status: "ACTIVE" },
      include: { helper: { include: { user: true } } },
    }),
    prisma.replacementRequest.findMany({
      where: { householdId },
      include: {
        originalHelper: { include: { user: true } },
        matchedHelper: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Replacement requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Request a temporary or permanent replacement without starting your search from scratch.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>New request</CardTitle></CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no active contracts.</p>
          ) : (
            <ReplacementRequestForm
              contracts={contracts.map((c) => ({ id: c.id, helperName: c.helper.user.name }))}
              defaultContractId={contractId}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your requests</CardTitle></CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No replacement requests yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {r.type === "TEMPORARY" ? "Temporary" : "Permanent"} replacement for {r.originalHelper.user.name}
                    </p>
                    <p className="text-muted-foreground">{r.reason}</p>
                    {r.matchedHelper && (
                      <p className="mt-1 text-success">Matched with {r.matchedHelper.user.name}</p>
                    )}
                  </div>
                  <Badge variant={r.status === "MATCHED" ? "success" : "outline"}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
