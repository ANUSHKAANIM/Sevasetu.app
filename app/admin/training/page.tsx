import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCourseForm } from "@/components/admin/create-course-form";

export const metadata: Metadata = { title: "Training — SevaSetu Admin" };

export default async function AdminTrainingPage() {
  await requireAdminContext();

  const courses = await prisma.trainingCourse.findMany({
    include: { enrollments: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Training management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create courses and monitor enrollment.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Create a course</CardTitle></CardHeader>
        <CardContent><CreateCourseForm /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Courses</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border">
          {courses.map((c) => {
            const completed = c.enrollments.filter((e) => e.status === "COMPLETED").length;
            const inProgress = c.enrollments.filter((e) => e.status === "IN_PROGRESS").length;
            return (
              <div key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-muted-foreground">{c.category.replace("_", " ")} · {c.durationHours} hrs</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{inProgress} in progress</Badge>
                  <Badge variant="success">{completed} completed</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
