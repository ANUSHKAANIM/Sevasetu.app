import {
  LayoutDashboard,
  UserCircle,
  Award,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  Plane,
  IndianRupee,
  ShieldPlus,
  MessageSquareWarning,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireHelperContext } from "@/lib/session-helpers";
import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";

const NAV_ITEMS: PortalNavItem[] = [
  { href: "/helper/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/helper/profile", label: "My Profile", icon: UserCircle },
  { href: "/helper/skills", label: "Skills & Assessments", icon: Award },
  { href: "/helper/training", label: "Training", icon: GraduationCap },
  { href: "/helper/jobs", label: "Job Matches", icon: Briefcase },
  { href: "/helper/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/helper/leave", label: "Leave", icon: Plane },
  { href: "/helper/payments", label: "Payments", icon: IndianRupee },
  { href: "/helper/benefits", label: "Benefits", icon: ShieldPlus },
  { href: "/helper/grievances", label: "Grievances", icon: MessageSquareWarning },
];

export default async function HelperLayout({ children }: LayoutProps<"/helper">) {
  const { session } = await requireHelperContext();
  const unreadNotificationCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return (
    <PortalShell
      brandLabel="Helper Portal"
      userName={session.name}
      userEmail={session.email}
      navItems={NAV_ITEMS}
      unreadNotificationCount={unreadNotificationCount}
    >
      {children}
    </PortalShell>
  );
}
