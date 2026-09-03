import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { enrollInCourseAction, advanceTrainingProgressAction } from "@/app/actions/training-actions";

export const metadata: Metadata = { title: "Training — SevaSetu" };

export default async function HelperTrainingPage() {
  const { helperId } = await requireHelperContext();

  const [courses, enrollments] = await Promise.all([
    prisma.trainingCourse.findMany({ where: { isActive: true }, orderBy: { title: "asc" } }),
    prisma.trainingEnrollment.findMany({ where: { helperId } }),
  ]);

  const enrollmentByCourseId = new Map(enrollments.map((e) => [e.courseId, e]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Training</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build your professional skills and earn certificates that support higher skill tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses.map((course) => {
          const enrollment = enrollmentByCourseId.get(course.id);
          return (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.category.replace("_", " ")} · {course.durationHours} hrs
                    </p>
                  </div>
                  {enrollment?.status === "COMPLETED" && <Badge variant="success">Completed</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>

                {enrollment ? (
                  <div className="mt-4 space-y-2">
                    <Progress value={enrollment.progress} />
                    <p className="text-xs text-muted-foreground">{enrollment.progress}% complete</p>
                    {enrollment.status !== "COMPLETED" && (
                      <form action={advanceTrainingProgressAction.bind(null, enrollment.id)}>
                        <Button size="sm" variant="outline">Continue course</Button>
                      </form>
                    )}
                    {enrollment.certificateRef && (
                      <p className="text-xs text-muted-foreground">
                        Certificate: {enrollment.certificateRef}
                      </p>
                    )}
                  </div>
                ) : (
                  <form action={enrollInCourseAction.bind(null, course.id)} className="mt-4">
                    <Button size="sm">Enroll</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
