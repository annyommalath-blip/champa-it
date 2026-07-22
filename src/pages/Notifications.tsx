import { useEffect, useState } from "react";
import { Bell, Package, MessageCircle, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .neq("type", "chat_message")
        .order("created_at", { ascending: false })
        .limit(100);
      setItems(data ?? []);
      setLoading(false);

      channel = supabase
        .channel(`notif-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const n = payload.new as Notification;
            if (n.type === "chat_message") return;
            setItems((prev) => [n, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => setItems((prev) => prev.map((n) => (n.id === (payload.new as Notification).id ? (payload.new as Notification) : n)))
        )
        .subscribe();
    })();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const markAllRead = async () => {
    if (!userId) return;
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    if (ids.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
  };

  const openItem = async (n: Notification) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    if (n.type.startsWith("order_") && n.reference_id) navigate(`/profile/orders/${n.reference_id}`);
    else if (n.type === "chat_message") navigate("/chat");
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  const iconFor = (type: string) => {
    if (type.startsWith("order_")) return <Package className="w-5 h-5" strokeWidth={2} />;
    if (type === "chat_message") return <MessageCircle className="w-5 h-5" strokeWidth={2} />;
    return <Bell className="w-5 h-5" strokeWidth={2} />;
  };

  return (
    <div className="px-5 py-5 space-y-4 md:max-w-2xl md:mx-auto md:px-8 md:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{t("notifications.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : t("notifications.subtitle")}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground/70 px-3 py-1.5 rounded-full bg-card active:scale-95 transition-transform"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">{t("notifications.empty")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("notifications.emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => openItem(n)}
              className="w-full flex items-start gap-3 p-4 rounded-2xl bg-card text-left active:scale-[0.99] transition-transform"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.is_read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                {iconFor(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[14px] tracking-tight truncate ${n.is_read ? "font-semibold text-foreground/80" : "font-bold text-foreground"}`}>{n.title}</p>
                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-[12.5px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
