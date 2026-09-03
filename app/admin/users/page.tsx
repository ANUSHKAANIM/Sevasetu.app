import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VERIFICATION_STATUS_LABEL } from "@/lib/constants";
import { toggleUserActiveAction } from "@/app/actions/admin-actions";

export const metadata: Metadata = { title: "Users — SevaSetu Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  await requireAdminContext();
  const { role } = await searchParams;
  const activeRole = role === "HELPER" || role === "ADMIN" ? role : "HOUSEHOLD";

  const users = await prisma.user.findMany({
    where: { role: activeRole },
    include: { householdProfile: true, helperProfile: true, adminProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage households, helpers and admin accounts.</p>
      </div>

      <div className="flex gap-2">
        {(["HOUSEHOLD", "HELPER", "ADMIN"] as const).map((r) => (
          <Button key={r} asChild size="sm" variant={activeRole === r ? "default" : "outline"}>
            <a href={`/admin/users?role=${r}`}>{r === "HOUSEHOLD" ? "Households" : r === "HELPER" ? "Helpers" : "Admins"}</a>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="divide-y divide-border pt-6">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users in this category.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email} · {u.phone ?? "No phone"}</p>
                  {u.helperProfile && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {u.helperProfile.city} · Identity: {VERIFICATION_STATUS_LABEL[u.helperProfile.identityVerification]}
                    </p>
                  )}
                  {u.householdProfile && (
                    <p className="mt-1 text-xs text-muted-foreground">{u.householdProfile.city}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.isActive ? "success" : "destructive"}>
                    {u.isActive ? "Active" : "Suspended"}
                  </Badge>
                  <form action={toggleUserActiveAction.bind(null, u.id)}>
                    <Button size="sm" variant="outline">{u.isActive ? "Suspend" : "Reactivate"}</Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
