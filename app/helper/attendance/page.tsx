import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Attendance — SevaSetu" };

export default async function HelperAttendancePage() {
  const { helperId } = await requireHelperContext();

  const records = await prisma.attendanceRecord.findMany({
    where: { contract: { helperId } },
    include: { contract: { include: { household: { include: { user: true } } } } },
    orderBy: { date: "desc" },
    take: 40,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Attendance is recorded by the household. If something looks wrong, raise a grievance.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Records</CardTitle></CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{r.contract.household.user.name}</span>
                  <span className="text-muted-foreground">{r.date.toLocaleDateString("en-IN")}</span>
                  <Badge
                    variant={
                      r.status === "PRESENT" ? "success" : r.status === "ABSENT" ? "destructive" : "outline"
                    }
                  >
                    {r.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          <Button asChild size="sm" variant="link" className="mt-3 px-0">
            <Link href="/helper/grievances">Dispute an attendance record →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
