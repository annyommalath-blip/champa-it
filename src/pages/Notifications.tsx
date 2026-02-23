import { useApp } from "@/context/AppContext";
import { Bell, MessageSquare, Package, Truck, CheckCircle, RotateCcw, MapPin, Briefcase, ChevronRight } from "lucide-react";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<Notification["type"], typeof Bell> = {
  chat: MessageSquare,
  contact_form: Briefcase,
  order_placed: Package,
  order_processing: RotateCcw,
  order_shipped: Truck,
  order_delivered: CheckCircle,
  order_pickup: MapPin,
  contact_sales: Briefcase,
};

const colorMap: Record<Notification["type"], string> = {
  chat: "bg-blue-100 text-blue-600",
  contact_form: "bg-purple-100 text-purple-600",
  order_placed: "bg-primary/15 text-primary",
  order_processing: "bg-orange-100 text-orange-600",
  order_shipped: "bg-sky-100 text-sky-600",
  order_delivered: "bg-green-100 text-green-600",
  order_pickup: "bg-teal-100 text-teal-600",
  contact_sales: "bg-purple-100 text-purple-600",
};

export default function Notifications() {
  const { notifications, markNotificationRead } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-5 py-5 space-y-4 md:max-w-2xl md:mx-auto md:px-8 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => notifications.forEach((n) => !n.read && markNotificationRead(n.id))}
            className="text-xs font-medium text-primary"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            const color = colorMap[n.type] || "bg-muted text-muted-foreground";
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`w-full text-left app-card p-4 flex items-start gap-3 transition-all ${
                  !n.read ? "border-primary/20 bg-primary/[0.02]" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold text-foreground ${!n.read ? "" : "font-medium"}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
