import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  delivery_method: string | null;
  items: any;
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,total,status,created_at,delivery_method,items")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="px-5 py-5 space-y-5 md:max-w-3xl md:mx-auto md:px-8 md:py-8 animate-fade-in">
      <Link to="/profile" className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-page-title text-foreground">My Orders</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.6} />
          </div>
          <p className="text-[14px] text-muted-foreground">No orders yet</p>
          <Link to="/shop"><button className="btn-primary">Start shopping</button></Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => {
            const count = Array.isArray(o.items) ? o.items.length : 0;
            return (
              <div key={o.id} className="bento-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                  <Package className="w-4 h-4 text-foreground/70" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-foreground tracking-tight">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <span className="badge-status bg-primary/10 text-primary capitalize text-[9px]">{o.status}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    {count} item{count !== 1 ? "s" : ""} · {new Date(o.created_at).toLocaleDateString()} · {o.delivery_method || "—"}
                  </p>
                  <p className="text-[13px] font-semibold text-foreground mt-1">${Number(o.total).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
