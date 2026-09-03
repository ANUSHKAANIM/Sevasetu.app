import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, type SessionPayload } from "@/lib/auth";

export async function requireHouseholdContext(): Promise<{
  session: SessionPayload;
  householdId: string;
}> {
  const session = await requireRole("HOUSEHOLD");
  const profile = await prisma.householdProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });
  if (!profile) notFound();
  return { session, householdId: profile.id };
}

export async function requireHelperContext(): Promise<{
  session: SessionPayload;
  helperId: string;
}> {
  const session = await requireRole("HELPER");
  const profile = await prisma.helperProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });
  if (!profile) notFound();
  return { session, helperId: profile.id };
}

export async function requireAdminContext(): Promise<{
  session: SessionPayload;
}> {
  const session = await requireRole("ADMIN");
  return { session };
}
