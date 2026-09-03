import { describe, it, expect } from "vitest";
import {
  canAccessOwnRecord,
  assertCanAccessOwnRecord,
  assertRole,
  UnauthorizedError,
} from "@/lib/authz";
import type { SessionPayload } from "@/lib/auth";

function session(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    userId: "user-1",
    role: "HOUSEHOLD",
    name: "Test User",
    email: "test@example.com",
    ...overrides,
  };
}

describe("canAccessOwnRecord", () => {
  it("allows a user to access their own record", () => {
    expect(canAccessOwnRecord(session({ userId: "user-1" }), "user-1")).toBe(
      true
    );
  });

  it("denies a household from accessing another household's record", () => {
    expect(canAccessOwnRecord(session({ userId: "user-1" }), "user-2")).toBe(
      false
    );
  });

  it("denies a helper from accessing another helper's record", () => {
    const helperSession = session({ userId: "helper-1", role: "HELPER" });
    expect(canAccessOwnRecord(helperSession, "helper-2")).toBe(false);
  });

  it("always allows admins, regardless of ownership", () => {
    const adminSession = session({ userId: "admin-1", role: "ADMIN" });
    expect(canAccessOwnRecord(adminSession, "someone-else")).toBe(true);
  });
});

describe("assertCanAccessOwnRecord", () => {
  it("throws UnauthorizedError for a mismatched owner", () => {
    expect(() =>
      assertCanAccessOwnRecord(session({ userId: "user-1" }), "user-2")
    ).toThrow(UnauthorizedError);
  });

  it("does not throw for the owning user", () => {
    expect(() =>
      assertCanAccessOwnRecord(session({ userId: "user-1" }), "user-1")
    ).not.toThrow();
  });
});

describe("assertRole", () => {
  it("throws when the session role is not in the allowed list", () => {
    expect(() => assertRole(session({ role: "HELPER" }), "ADMIN")).toThrow(
      UnauthorizedError
    );
  });

  it("does not throw when the session role is allowed", () => {
    expect(() =>
      assertRole(session({ role: "ADMIN" }), "ADMIN", "HOUSEHOLD")
    ).not.toThrow();
  });
});
