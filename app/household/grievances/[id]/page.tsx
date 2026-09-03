import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { assertCanAccessOwnRecord } from "@/lib/authz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrievanceThread } from "@/components/shared/grievance-thread";

export const metadata: Metadata = { title: "Grievance — SevaSetu" };

export default async function HouseholdGrievanceDetailPage({
  params,
}: PageProps<"/household/grievances/[id]">) {
  const { session } = await requireHouseholdContext();
  const { id } = await params;

  const grievance = await prisma.grievance.findUnique({
    where: { id },
    include: { messages: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!grievance) notFound();
  assertCanAccessOwnRecord(session, grievance.raisedById);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{grievance.subject}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{grievance.category.replace("_", " ")}</p>
          </div>
          <Badge variant={grievance.status === "RESOLVED" ? "success" : "outline"}>
            {grievance.status.replace("_", " ")}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{grievance.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent>
          <GrievanceThread
            grievanceId={grievance.id}
            canViewInternalNotes={false}
            messages={grievance.messages.map((m) => ({
              id: m.id,
              authorName: m.author.name,
              isAdmin: m.author.id !== grievance.raisedById,
              isInternalNote: m.isInternalNote,
              message: m.message,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
