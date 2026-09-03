import {
  LayoutDashboard,
  Search,
  FileText,
  CalendarCheck,
  Plane,
  IndianRupee,
  RefreshCcw,
  MessageSquareWarning,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHouseholdContext } from "@/lib/session-helpers";
import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";

const NAV_ITEMS: PortalNavItem[] = [
  { href: "/household/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/household/search", label: "Find Helpers", icon: Search },
  { href: "/household/contracts", label: "Contracts", icon: FileText },
  { href: "/household/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/household/leave", label: "Leave Requests", icon: Plane },
  { href: "/household/payments", label: "Payments", icon: IndianRupee },
  { href: "/household/replacement", label: "Replacement", icon: RefreshCcw },
  { href: "/household/grievances", label: "Grievances", icon: MessageSquareWarning },
];

export default async function HouseholdLayout({
  children,
}: LayoutProps<"/household">) {
  const { session } = await requireHouseholdContext();
  const unreadNotificationCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return (
    <PortalShell
      brandLabel="Household Portal"
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
