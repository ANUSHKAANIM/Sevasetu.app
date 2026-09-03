import type { Role } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Admins can access anything. Otherwise the session must belong to the owning user. */
export function canAccessOwnRecord(
  session: SessionPayload,
  ownerUserId: string
): boolean {
  return session.role === "ADMIN" || session.userId === ownerUserId;
}

export function assertCanAccessOwnRecord(
  session: SessionPayload,
  ownerUserId: string
): void {
  if (!canAccessOwnRecord(session, ownerUserId)) {
    throw new UnauthorizedError();
  }
}

export function assertRole(session: SessionPayload, ...roles: Role[]): void {
  if (!roles.includes(session.role)) {
    throw new UnauthorizedError(
      `This action requires one of the following roles: ${roles.join(", ")}.`
    );
  }
}
