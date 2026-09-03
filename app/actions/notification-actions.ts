"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { assertCanAccessOwnRecord } from "@/lib/authz";

export async function markNotificationReadAction(notificationId: string) {
  const session = await getSession();
  if (!session) return;

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) return;
  assertCanAccessOwnRecord(session, notification.userId);

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}
