import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationFieldControl } from "@/components/admin/verification-field-control";
import { PersonAvatar } from "@/components/shared/person-avatar";

export const metadata: Metadata = { title: "Verification — SevaSetu Admin" };

export default async function AdminVerificationPage() {
  await requireAdminContext();

  const helpers = await prisma.helperProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Verification management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identity, address, reference and background-check workflow statuses. These are MVP
          workflow states, not automated government verification — see{" "}
          <a href="/legal" className="underline">legal &amp; compliance notes</a>.
        </p>
      </div>

      <div className="space-y-3">
        {helpers.map((h) => (
          <Card key={h.id}>
            <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-5 sm:items-center">
              <div className="flex items-center gap-3 sm:col-span-1">
                <PersonAvatar id={h.id} name={h.user.name} size="sm" />
                <div>
                  <p className="font-medium">{h.user.name}</p>
                  <p className="text-xs text-muted-foreground">{h.city}</p>
                </div>
              </div>
              <VerificationFieldControl helperId={h.id} field="identityVerification" label="Identity" value={h.identityVerification} />
              <VerificationFieldControl helperId={h.id} field="addressVerification" label="Address" value={h.addressVerification} />
              <VerificationFieldControl helperId={h.id} field="referenceVerification" label="References" value={h.referenceVerification} />
              <VerificationFieldControl helperId={h.id} field="backgroundCheck" label="Background" value={h.backgroundCheck} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
