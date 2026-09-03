import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { HiringWizard } from "@/components/household/hiring-wizard";

export const metadata: Metadata = { title: "Hire a Professional — SevaSetu" };

export default async function HirePage({
  params,
}: PageProps<"/household/hire/[helperId]">) {
  await requireHouseholdContext();
  const { helperId } = await params;

  const helper = await prisma.helperProfile.findUnique({
    where: { id: helperId },
    include: {
      user: true,
      helperServices: { include: { serviceCategory: true } },
    },
  });

  if (!helper || helper.helperServices.length === 0) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <HiringWizard
        helperId={helper.id}
        helperName={helper.user.name}
        services={helper.helperServices.map((hs) => ({
          serviceCategoryId: hs.serviceCategoryId,
          name: hs.serviceCategory.name,
        }))}
      />
    </div>
  );
}
