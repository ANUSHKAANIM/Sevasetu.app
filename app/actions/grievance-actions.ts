"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireSession } from "@/lib/auth";
import { requireAdminContext } from "@/lib/session-helpers";
import { assertCanAccessOwnRecord } from "@/lib/authz";

export interface GrievanceFormState {
  error?: string;
  success?: boolean;
}

const createGrievanceSchema = z.object({
  contractId: z.string().optional(),
  category: z.enum([
    "PAYMENT_ISSUE",
    "WORKPLACE_CONCERN",
    "ATTENDANCE_DISPUTE",
    "LEAVE_DISPUTE",
    "OTHER",
  ]),
  subject: z.string().min(3, "Enter a short subject."),
  description: z.string().min(10, "Please describe the issue in a bit more detail."),
});

export async function createGrievanceAction(
  _prevState: GrievanceFormState,
  formData: FormData
): Promise<GrievanceFormState> {
  const session = await requireSession();

  const parsed = createGrievanceSchema.safeParse({
    contractId: formData.get("contractId") || undefined,
    category: formData.get("category"),
    subject: formData.get("subject"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid grievance." };
  }

  await prisma.grievance.create({
    data: {
      raisedById: session.userId,
      contractId: parsed.data.contractId,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "OPEN",
    },
  });

  revalidatePath("/household/grievances");
  revalidatePath("/helper/grievances");
  revalidatePath("/admin/grievances");
  return { success: true };
}

export async function addGrievanceMessageAction(
  _prevState: GrievanceFormState,
  formData: FormData
): Promise<GrievanceFormState> {
  const session = await requireSession();
  const grievanceId = formData.get("grievanceId") as string;
  const message = (formData.get("message") as string)?.trim();

  if (!message || message.length < 2) {
    return { error: "Enter a message." };
  }

  const grievance = await prisma.grievance.findUniqueOrThrow({ where: { id: grievanceId } });
  const isParticipant =
    grievance.raisedById === session.userId || session.role === "ADMIN";
  if (!isParticipant) {
    return { error: "You cannot reply to this grievance." };
  }

  await prisma.grievanceMessage.create({
    data: {
      grievanceId,
      authorId: session.userId,
      message,
      isInternalNote: false,
    },
  });

  if (session.role === "ADMIN" && grievance.status === "OPEN") {
    await prisma.grievance.update({
      where: { id: grievanceId },
      data: { status: "UNDER_REVIEW" },
    });
  }

  if (session.role === "ADMIN") {
    await prisma.notification.create({
      data: {
        userId: grievance.raisedById,
        type: "GRIEVANCE_RESPONSE",
        title: "New response to your grievance",
        message: "SevaSetu support has replied to your grievance.",
        link: `/grievances/${grievanceId}`,
      },
    });
  }

  revalidatePath(`/household/grievances/${grievanceId}`);
  revalidatePath(`/helper/grievances/${grievanceId}`);
  revalidatePath(`/admin/grievances/${grievanceId}`);
  return { success: true };
}

export async function updateGrievanceStatusAction(
  grievanceId: string,
  status: "UNDER_REVIEW" | "RESOLVED" | "CLOSED",
  adminNotes?: string
) {
  await requireAdminContext();

  await prisma.grievance.update({
    where: { id: grievanceId },
    data: { status, adminNotes },
  });

  revalidatePath(`/admin/grievances/${grievanceId}`);
  revalidatePath("/admin/grievances");
}

export async function assertGrievanceAccess(grievanceId: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  const grievance = await prisma.grievance.findUniqueOrThrow({ where: { id: grievanceId } });
  assertCanAccessOwnRecord(session, grievance.raisedById);
  return grievance;
}
