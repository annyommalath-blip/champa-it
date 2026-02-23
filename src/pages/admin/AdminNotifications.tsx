import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";

export default function AdminNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetch = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    setNotifications(data || []);
  };

  useEffect(() => { fetch(); }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetch();
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.filter((n) => !n.is_read).length} unread</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
          <Check className="w-3.5 h-3.5" /> Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={!n.is_read ? "border-primary/30 bg-primary/5" : ""}>
            <CardContent className="flex items-start gap-3 py-4">
              <Bell className={`w-4 h-4 mt-0.5 ${!n.is_read ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => markRead(n.id)}>
                  Mark read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No notifications.</p>
        )}
      </div>
    </div>
  );
}
