import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceForm } from "@/components/household/attendance-form";

export const metadata: Metadata = { title: "Attendance — SevaSetu" };

export default async function HouseholdAttendancePage() {
  const { householdId } = await requireHouseholdContext();

  const contracts = await prisma.employmentContract.findMany({
    where: { householdId, status: "ACTIVE" },
    include: { helper: { include: { user: true } } },
  });

  const records = await prisma.attendanceRecord.findMany({
    where: { contract: { householdId } },
    include: { contract: { include: { helper: { include: { user: true } } } } },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mark daily attendance for your active helpers. Records are timestamped and auditable.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Mark attendance</CardTitle></CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no active contracts yet.</p>
          ) : (
            <AttendanceForm
              contracts={contracts.map((c) => ({ id: c.id, helperName: c.helper.user.name }))}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent records</CardTitle></CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {records.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{r.contract.helper.user.name}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
