import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Briefcase, IndianRupee, UserCircle, LifeBuoy, PartyPopper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Home — SevaSetu" };

export default async function HelperDashboardPage() {
  const { helperId, session } = await requireHelperContext();

  const [activeJobsCount, pendingOffersCount, nextPayment] = await Promise.all([
    prisma.employmentContract.count({ where: { helperId, status: "ACTIVE" } }),
    prisma.jobRequest.count({ where: { helperId, status: "PENDING" } }),
    prisma.payment.findFirst({
      where: { helperId, status: { in: ["PENDING", "PROCESSING"] } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const firstName = session.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Hello, {firstName}</h1>
        <p className="mt-1 text-lg text-muted-foreground">Here is your work, at a glance.</p>
      </div>

      {pendingOffersCount > 0 && (
        <Link href="/helper/jobs">
          <Card className="border-2 border-accent bg-accent/10 transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <PartyPopper className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-semibold">
                  You have {pendingOffersCount} new job {pendingOffersCount === 1 ? "offer" : "offers"}!
                </p>
                <p className="text-muted-foreground">Tap here to see it and reply</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HomeTile
          href="/helper/jobs"
          icon={Briefcase}
          title="My Jobs"
          detail={`${activeJobsCount} active ${activeJobsCount === 1 ? "job" : "jobs"}`}
        />
        <HomeTile
          href="/helper/money"
          icon={IndianRupee}
          title="My Money"
          detail={
            nextPayment
              ? `₹${Number(nextPayment.totalAmount).toLocaleString("en-IN")} coming soon`
              : "See your payment history"
          }
        />
        <HomeTile href="/helper/profile" icon={UserCircle} title="My Profile" detail="Update your details" />
        <HomeTile href="/helper/grievances" icon={LifeBuoy} title="Get Help" detail="Ask a question or report a problem" />
      </div>
    </div>
  );
}

function HomeTile({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-semibold">{title}</p>
            <p className="text-muted-foreground">{detail}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
