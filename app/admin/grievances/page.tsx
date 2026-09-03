import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Grievances — SevaSetu Admin" };

export default async function AdminGrievancesPage() {
  await requireAdminContext();

  const grievances = await prisma.grievance.findMany({
    include: { raisedBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Grievance management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, respond to, and resolve grievances from households and helpers.
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border pt-6">
          {grievances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grievances yet.</p>
          ) : (
            grievances.map((g) => (
              <Link
                key={g.id}
                href={`/admin/grievances/${g.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{g.subject}</p>
                  <p className="text-muted-foreground">
                    {g.raisedBy.name} · {g.category.replace("_", " ")}
                  </p>
                </div>
                <Badge
                  variant={
                    g.status === "RESOLVED" ? "success" : g.status === "OPEN" ? "warning" : "outline"
                  }
                >
                  {g.status.replace("_", " ")}
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
