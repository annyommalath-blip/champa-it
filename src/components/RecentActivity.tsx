import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const STATUS_META: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "text-muted-foreground" },
  confirmed: { label: "Confirmed", tone: "text-cyan" },
  processing: { label: "Preparing", tone: "text-primary" },
  shipped: { label: "Shipped", tone: "text-cyan" },
  delivered: { label: "Delivered", tone: "text-success" },
  picked_up: { label: "Picked up", tone: "text-success" },
  cancelled: { label: "Cancelled", tone: "text-destructive" },
};

const relativeDay = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
};

const statusLine = (status: string, created_at: string) => {
  const meta = STATUS_META[status] || { label: status, tone: "text-muted-foreground" };
  const when = relativeDay(created_at);
  if (status === "delivered" || status === "picked_up") return `${meta.label} ${when}`;
  if (status === "shipped") return `Shipped · Arriving soon`;
  if (status === "processing") return `Preparing your order`;
  if (status === "confirmed") return `Order confirmed · ${when}`;
  if (status === "pending") return `Awaiting confirmation`;
  if (status === "cancelled") return `Cancelled · ${when}`;
  return `${meta.label} · ${when}`;
};

export default function RecentActivity() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status,items,total,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      const list = data || [];
      setOrders(list);

      const ids = Array.from(new Set(
        list.flatMap((o: any) => (Array.isArray(o.items) ? o.items : []).map((i: any) => i.product_id).filter(Boolean))
      ));
      if (ids.length > 0) {
        const { data: prods } = await supabase.from("products").select("id,images").in("id", ids);
        const map: Record<string, string> = {};
        (prods || []).forEach((p: any) => {
          const img = Array.isArray(p.images) ? p.images[0] : null;
          if (img) map[p.id] = img;
        });
        setProductImages(map);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading || orders.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2 px-1">
        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em]">Recent activity</p>
        <Link to="/profile/orders" className="text-[11px] font-semibold text-foreground/70 hover:text-foreground">View all</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1 snap-x snap-mandatory">
        {orders.map((o) => {
          const meta = STATUS_META[o.status] || { label: o.status, tone: "text-foreground" };
          const items = Array.isArray(o.items) ? o.items : [];
          const first = items[0];
          const image = productImages[first?.product_id] || first?.image_url || first?.image;
          return (
            <Link
              key={o.id}
              to={`/profile/orders/${o.id}`}
              className="bento-card shrink-0 w-[260px] snap-start p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
                {image ? (
                  <img src={image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-5 h-5 text-muted-foreground/50" strokeWidth={1.6} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[15px] font-bold tracking-tight ${meta.tone}`}>{meta.label}</p>
                <p className="text-[12px] text-foreground/80 truncate">{statusLine(o.status, o.created_at)}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  #{o.id.slice(0, 6).toUpperCase()} · {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
