import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrievanceForm } from "@/components/shared/grievance-form";

export const metadata: Metadata = { title: "Grievances — SevaSetu" };

export default async function HouseholdGrievancesPage({
  searchParams,
}: {
  searchParams: Promise<{ contractId?: string }>;
}) {
  const { session, householdId } = await requireHouseholdContext();
  const { contractId } = await searchParams;

  const [contracts, grievances] = await Promise.all([
    prisma.employmentContract.findMany({
      where: { householdId },
      include: { helper: { include: { user: true } } },
    }),
    prisma.grievance.findMany({
      where: { raisedById: session.userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Grievances</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Raise concerns about payments, workplace issues, attendance or leave.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Raise a grievance</CardTitle></CardHeader>
        <CardContent>
          <GrievanceForm
            contracts={contracts.map((c) => ({ id: c.id, label: c.helper.user.name }))}
            defaultContractId={contractId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your grievances</CardTitle></CardHeader>
        <CardContent>
          {grievances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grievances raised yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {grievances.map((g) => (
                <Link
                  key={g.id}
                  href={`/household/grievances/${g.id}`}
                  className="flex items-center justify-between py-3 text-sm hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{g.subject}</p>
                    <p className="text-muted-foreground">{g.category.replace("_", " ")}</p>
                  </div>
                  <Badge variant={g.status === "RESOLVED" ? "success" : "outline"}>
                    {g.status.replace("_", " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
