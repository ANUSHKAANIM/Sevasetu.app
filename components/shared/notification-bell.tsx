import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/actions/notification-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function NotificationBell({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const session = await getSession();
  const notifications = session
    ? await prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <form action={markAllNotificationsReadAction}>
              <button className="text-xs text-primary hover:underline">Mark all read</button>
            </form>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <form
                key={n.id}
                action={markNotificationReadAction.bind(null, n.id)}
              >
                <button
                  type="submit"
                  className={`block w-full border-b border-border px-3 py-2.5 text-left text-sm last:border-0 hover:bg-muted ${
                    n.isRead ? "opacity-60" : ""
                  }`}
                >
                  <p className="font-medium leading-snug">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </p>
                </button>
              </form>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
