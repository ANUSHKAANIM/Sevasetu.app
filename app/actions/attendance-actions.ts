"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";

const markAttendanceSchema = z.object({
  contractId: z.string(),
  date: z.string(),
  status: z.enum(["PRESENT", "ABSENT", "LEAVE", "HALF_DAY"]),
  notes: z.string().optional(),
});

export interface AttendanceFormState {
  error?: string;
  success?: boolean;
}

export async function markAttendanceAction(
  _prevState: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  const { householdId } = await requireHouseholdContext();

  const parsed = markAttendanceSchema.safeParse({
    contractId: formData.get("contractId"),
    date: formData.get("date"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid attendance entry." };
  }

  const contract = await prisma.employmentContract.findUnique({
    where: { id: parsed.data.contractId },
  });
  if (!contract || contract.householdId !== householdId) {
    return { error: "Contract not found." };
  }

  await prisma.attendanceRecord.upsert({
    where: {
      contractId_date: {
        contractId: parsed.data.contractId,
        date: new Date(parsed.data.date),
      },
    },
    create: {
      contractId: parsed.data.contractId,
      date: new Date(parsed.data.date),
      status: parsed.data.status,
      markedById: householdId,
      notes: parsed.data.notes,
    },
    update: {
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/household/attendance");
  revalidatePath("/helper/attendance");
  return { success: true };
}
