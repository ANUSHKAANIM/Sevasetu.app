"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireHelperContext, requireAdminContext } from "@/lib/session-helpers";

export async function enrollInCourseAction(courseId: string) {
  const { helperId } = await requireHelperContext();

  await prisma.trainingEnrollment.upsert({
    where: { helperId_courseId: { helperId, courseId } },
    create: { helperId, courseId, status: "IN_PROGRESS", progress: 5 },
    update: {},
  });

  revalidatePath("/helper/training");
}

export async function advanceTrainingProgressAction(enrollmentId: string) {
  const { helperId } = await requireHelperContext();

  const enrollment = await prisma.trainingEnrollment.findUniqueOrThrow({
    where: { id: enrollmentId },
  });
  if (enrollment.helperId !== helperId) throw new Error("Not your enrollment.");

  const nextProgress = Math.min(enrollment.progress + 25, 100);
  const completed = nextProgress >= 100;

  await prisma.trainingEnrollment.update({
    where: { id: enrollmentId },
    data: {
      progress: nextProgress,
      status: completed ? "COMPLETED" : "IN_PROGRESS",
      completedAt: completed ? new Date() : null,
      certificateRef: completed ? `CERT-${enrollmentId.slice(-8).toUpperCase()}` : null,
    },
  });

  revalidatePath("/helper/training");
}

export interface TrainingCourseFormState {
  error?: string;
  success?: boolean;
}

export async function createTrainingCourseAction(
  _prevState: TrainingCourseFormState,
  formData: FormData
): Promise<TrainingCourseFormState> {
  await requireAdminContext();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const durationHours = Number(formData.get("durationHours"));

  if (!title || !description || !category || !durationHours) {
    return { error: "Fill in all course fields." };
  }

  await prisma.trainingCourse.create({
    data: {
      title,
      description,
      category: category as never,
      durationHours,
    },
  });

  revalidatePath("/admin/training");
  return { success: true };
}
