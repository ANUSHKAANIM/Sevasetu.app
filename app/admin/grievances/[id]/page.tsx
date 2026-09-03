import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrievanceThread } from "@/components/shared/grievance-thread";
import { GrievanceStatusControl } from "@/components/admin/grievance-status-control";

export const metadata: Metadata = { title: "Grievance — SevaSetu Admin" };

export default async function AdminGrievanceDetailPage({
  params,
}: PageProps<"/admin/grievances/[id]">) {
  await requireAdminContext();
  const { id } = await params;

  const grievance = await prisma.grievance.findUnique({
    where: { id },
    include: {
      raisedBy: true,
      contract: { include: { serviceCategory: true } },
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!grievance) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{grievance.subject}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Raised by {grievance.raisedBy.name} ({grievance.raisedBy.role}) ·{" "}
              {grievance.category.replace("_", " ")}
              {grievance.contract && ` · ${grievance.contract.serviceCategory.name}`}
            </p>
          </div>
          <GrievanceStatusControl grievanceId={grievance.id} status={grievance.status} />
        </CardHeader>
        <CardContent>
          <p className="text-sm">{grievance.description}</p>
          {grievance.adminNotes && (
            <div className="mt-3 rounded-md bg-warning/10 p-3 text-sm">
              <p className="font-medium">Internal note</p>
              <p className="text-muted-foreground">{grievance.adminNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent>
          <GrievanceThread
            grievanceId={grievance.id}
            canViewInternalNotes
            messages={grievance.messages.map((m) => ({
              id: m.id,
              authorName: m.author.name,
              isAdmin: m.author.role === "ADMIN",
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
