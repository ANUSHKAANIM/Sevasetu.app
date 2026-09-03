import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  IndianRupee,
  FileText,
  CreditCard,
  GraduationCap,
  RefreshCcw,
  MessageSquareWarning,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminContext } from "@/lib/session-helpers";
import { PortalShell, type PortalNavItem } from "@/components/shared/portal-shell";

const NAV_ITEMS: PortalNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { href: "/admin/salary-rules", label: "Salary Rules", icon: IndianRupee },
  { href: "/admin/contracts", label: "Jobs & Contracts", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/training", label: "Training", icon: GraduationCap },
  { href: "/admin/replacements", label: "Replacements", icon: RefreshCcw },
  { href: "/admin/grievances", label: "Grievances", icon: MessageSquareWarning },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { session } = await requireAdminContext();
  const unreadNotificationCount = await prisma.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return (
    <PortalShell
      brandLabel="Admin Portal"
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
