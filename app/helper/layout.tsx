import {
  House,
  Briefcase,
  IndianRupee,
  UserCircle,
  LifeBuoy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";

const NAV_ITEMS: PortalNavItem[] = [
  { href: "/helper/dashboard", label: "Home", icon: House },
  { href: "/helper/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/helper/money", label: "My Money", icon: IndianRupee },
  { href: "/helper/profile", label: "My Profile", icon: UserCircle },
  { href: "/helper/grievances", label: "Get Help", icon: LifeBuoy },
];

export default async function HelperLayout({ children }: LayoutProps<"/helper">) {
  const { session } = await requireHelperContext();
  const unreadNotificationCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return (
    <PortalShell
      brandLabel="Helper Portal"
      userId={session.userId}
      userName={session.name}
      userEmail={session.email}
      navItems={NAV_ITEMS}
      unreadNotificationCount={unreadNotificationCount}
    >
      {children}
    </PortalShell>
  );
}
