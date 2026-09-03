import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReplacementAdminControls } from "@/components/admin/replacement-admin-controls";

export const metadata: Metadata = { title: "Replacements — SevaSetu Admin" };

export default async function AdminReplacementsPage() {
  await requireAdminContext();

  const requests = await prisma.replacementRequest.findMany({
    include: {
      household: { include: { user: true } },
      originalHelper: { include: { user: true } },
      matchedHelper: { include: { user: true } },
      contract: { include: { serviceCategory: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const candidateHelpers = await prisma.helperProfile.findMany({
    where: { identityVerification: "VERIFIED" },
    include: { user: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Replacement requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Match households needing temporary or permanent replacements with available helpers.
        </p>
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  {r.household.user.name} — {r.type === "TEMPORARY" ? "Temporary" : "Permanent"} replacement
                </p>
                <p className="text-sm text-muted-foreground">
                  For {r.originalHelper.user.name} ({r.contract.serviceCategory.name})
                </p>
                <p className="mt-1 text-sm">{r.reason}</p>
                {r.matchedHelper && (
                  <p className="mt-1 text-sm text-success">Matched with {r.matchedHelper.user.name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={r.status === "MATCHED" ? "success" : "outline"}>{r.status}</Badge>
                {r.status !== "CLOSED" && (
                  <ReplacementAdminControls
                    replacementRequestId={r.id}
                    candidates={candidateHelpers
                      .filter((h) => h.id !== r.originalHelperId)
                      .map((h) => ({ id: h.id, name: h.user.name }))}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">No replacement requests.</p>
        )}
      </div>
    </div>
  );
}
