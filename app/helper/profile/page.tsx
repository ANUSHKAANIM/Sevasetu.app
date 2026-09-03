import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HelperProfileForm } from "@/components/helper/profile-form";
import { ServicesManager } from "@/components/helper/services-manager";
import { VERIFICATION_STATUS_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "My Profile — SevaSetu" };

export default async function HelperProfilePage() {
  const { helperId } = await requireHelperContext();

  const [helper, categories] = await Promise.all([
    prisma.helperProfile.findUniqueOrThrow({
      where: { id: helperId },
      include: { helperServices: { include: { serviceCategory: true } } },
    }),
    prisma.serviceCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your profile up to date to improve your job matches.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Profile completeness</p>
          <Progress value={helper.profileCompleteness} className="mt-2" />
          <p className="mt-1 text-xs text-muted-foreground">{helper.profileCompleteness}% complete</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Verification status</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <VerificationRow label="Identity" status={helper.identityVerification} />
          <VerificationRow label="Address" status={helper.addressVerification} />
          <VerificationRow label="References" status={helper.referenceVerification} />
          <VerificationRow label="Background check" status={helper.backgroundCheck} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Basic information</CardTitle></CardHeader>
        <CardContent>
          <HelperProfileForm
            bio={helper.bio}
            city={helper.city}
            languages={helper.languages}
            experienceYears={helper.experienceYears}
            employmentTypePref={helper.employmentTypePref}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Services you offer</CardTitle></CardHeader>
        <CardContent>
          <ServicesManager
            currentServices={helper.helperServices.map((hs) => ({
              id: hs.id,
              name: hs.serviceCategory.name,
              yearsExperience: hs.yearsExperience,
            }))}
            allCategories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function VerificationRow({
  label,
  status,
}: {
  label: string;
  status: keyof typeof VERIFICATION_STATUS_LABEL;
}) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <Badge variant={status === "VERIFIED" ? "success" : status === "REJECTED" ? "destructive" : "outline"}>
        {VERIFICATION_STATUS_LABEL[status]}
      </Badge>
    </div>
  );
}
