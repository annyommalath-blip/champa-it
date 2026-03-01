import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, MessageSquare, Users, FileText, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, conversations: 0, pendingAdmins: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [prodRes, ordRes, convRes, adminRes, recentRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("admin_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        products: prodRes.count ?? 0,
        orders: ordRes.count ?? 0,
        conversations: convRes.count ?? 0,
        pendingAdmins: adminRes.count ?? 0,
      });
      setRecentOrders(recentRes.data || []);
    }
    load();
  }, []);

  const quickStats = [
    { icon: FileText, label: "Quotes", count: 0, color: "hsl(44 92% 53% / 0.12)", iconColor: "text-primary", link: "/admin" },
    { icon: Package, label: "Orders", count: stats.orders, color: "hsl(199 89% 48% / 0.1)", iconColor: "text-blue-500", link: "/admin/orders" },
    { icon: Headphones, label: "Support", count: stats.conversations, color: "hsl(152 60% 38% / 0.1)", iconColor: "text-green-500", link: "/admin/messages" },
  ];

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-accent" },
    { label: "Active Chats", value: stats.conversations, icon: MessageSquare, color: "text-green-500" },
    { label: "Pending Admins", value: stats.pendingAdmins, icon: Users, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your business</p>
      </div>

      {/* Quick Status Strip */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {quickStats.map((item) => (
          <Link
            key={item.label}
            to={item.link}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border flex-shrink-0 hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.color }}>
              <item.icon className={`w-4 h-4 ${item.iconColor}`} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-foreground leading-none tracking-tight">{item.count}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{o.id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${Number(o.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === "pending" ? "bg-orange-100 text-orange-700" :
                      o.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                      o.status === "shipped" ? "bg-purple-100 text-purple-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
