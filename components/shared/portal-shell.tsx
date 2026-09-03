import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/shared/notification-bell";
import { PersonAvatar } from "@/components/shared/person-avatar";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function PortalShell({
  brandLabel,
  userId,
  userName,
  userEmail,
  navItems,
  unreadNotificationCount,
  children,
}: {
  brandLabel: string;
  userId: string;
  userName: string;
  userEmail: string;
  navItems: PortalNavItem[];
  unreadNotificationCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="font-serif text-lg font-semibold text-primary">
            SevaSetu
          </Link>
        </div>
        <p className="px-6 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {brandLabel}
        </p>
        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <PersonAvatar id={userId} name={userName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8">
          <details className="md:hidden">
            <summary className="cursor-pointer list-none rounded-md border border-input px-3 py-1.5 text-sm font-medium">
              Menu
            </summary>
            <nav className="absolute z-30 mt-2 w-56 rounded-md border border-border bg-card p-2 shadow-md">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
          <p className="hidden text-sm font-medium text-muted-foreground md:block">{brandLabel}</p>
          <NotificationBell unreadCount={unreadNotificationCount} />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
