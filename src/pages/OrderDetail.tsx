import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ClipboardCheck, Package, Truck, Home, XCircle } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const STAGES = [
  { key: "pending", label: "Order placed", desc: "We received your order and are awaiting confirmation.", icon: ClipboardCheck },
  { key: "confirmed", label: "Store confirmed your order", desc: "Payment verified. Your order is queued for preparation.", icon: Check },
  { key: "processing", label: "Store is preparing your order", desc: "Items are being packed and readied for handover.", icon: Package },
  { key: "shipped", label: "Store has shipped your order", desc: "Your order is on its way.", icon: Truck },
  { key: "delivered", label: "Order delivered", desc: "Enjoy! Thanks for shopping with Champa.", icon: Home },
];

const stageIndex = (s: string) => STAGES.findIndex((x) => x.key === s);

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);



  const load = async () => {
    if (!id) return;
    const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    setOrder(data);
    const items = Array.isArray(data?.items) ? data.items : [];
    const ids = items.map((it: any) => it.product_id).filter(Boolean);
    if (ids.length > 0) {
      const { data: prods } = await supabase.from("products").select("id,name,images").in("id", ids);
      const map: Record<string, any> = {};
      (prods || []).forEach((p: any) => { map[p.id] = { ...p, image: Array.isArray(p.images) ? p.images[0] : null }; });
      setProducts(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  // Realtime status updates
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        setOrder((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="px-5 py-5 space-y-4 md:max-w-2xl md:mx-auto">
        <div className="h-6 w-24 bg-secondary/40 rounded animate-pulse" />
        <div className="h-40 rounded-2xl bg-secondary/40 animate-pulse" />
        <div className="h-64 rounded-2xl bg-secondary/40 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-5 py-16 text-center space-y-3">
        <p className="text-[14px] text-muted-foreground">Order not found.</p>
        <Link to="/profile/orders"><button className="btn-primary">Back to orders</button></Link>
      </div>
    );
  }

  const currentIdx = stageIndex(order.status);
  const cancelled = order.status === "cancelled";
  const items = Array.isArray(order.items) ? order.items : [];
  const customer = order.customer_info || {};

  return (
    <div className="px-5 py-5 space-y-5 md:max-w-2xl md:mx-auto md:px-8 md:py-8 animate-fade-in">
      <Link to="/profile/orders" className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      {/* Header */}
      <div className="bento-card p-5 space-y-1">
        <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Order</p>
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</h1>
        <p className="text-[12px] text-muted-foreground/70">
          Placed {new Date(order.created_at).toLocaleString()} · {order.delivery_method || "—"}
        </p>
        <p className="text-[18px] font-bold text-foreground mt-2">${Number(order.total).toLocaleString()}</p>
      </div>

      {/* Tracker - current status with dropdown */}
      <div className="bento-card p-5">
        {cancelled ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Shipment</p>
              <p className="text-[18px] font-bold text-destructive tracking-tight">Order cancelled</p>
              <p className="text-[12px] text-muted-foreground/70">Updated {new Date(order.updated_at).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                {(() => { const I = STAGES[Math.max(0, currentIdx)].icon; return <I className="w-5 h-5" strokeWidth={2.2} />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Shipment</p>
                <p className="text-[18px] font-bold text-foreground tracking-tight truncate">
                  {STAGES[Math.max(0, currentIdx)].label}
                </p>
                <p className="text-[12px] text-muted-foreground/70">
                  Updated {new Date(order.updated_at).toLocaleString()}
                </p>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground/60 transition-transform shrink-0 ${statusOpen ? "rotate-180" : ""}`} />
            </button>

            {statusOpen && (
              <div className="relative mt-5 pt-5 border-t border-border/50 animate-fade-in">
                {STAGES.map((s, i) => {
                  const done = currentIdx >= i;
                  const active = currentIdx === i;
                  const Icon = s.icon;
                  const isLast = i === STAGES.length - 1;
                  return (
                    <div key={s.key} className="flex gap-3.5 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground/50"
                        } ${active ? "ring-4 ring-primary/20" : ""}`}>
                          <Icon className="w-4 h-4" strokeWidth={2.2} />
                        </div>
                        {!isLast && <div className={`w-0.5 flex-1 min-h-[28px] ${currentIdx > i ? "bg-primary" : "bg-secondary"}`} />}
                      </div>
                      <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                        <p className={`text-[14px] font-bold tracking-tight ${done ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {s.label}
                        </p>
                        <p className={`text-[12px] mt-0.5 ${done ? "text-muted-foreground/70" : "text-muted-foreground/40"}`}>
                          {s.desc}
                        </p>
                        {active && (
                          <p className="text-[11px] font-semibold text-primary mt-1">
                            Updated {new Date(order.updated_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>


      {/* Items */}
      <div className="bento-card p-5">
        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mb-3">Items ({items.length})</p>
        <div className="space-y-3">
          {items.map((it: any, idx: number) => {
            const p = products[it.product_id];
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden shrink-0">
                  {p?.image ? (
                    <img src={p.image} alt={it.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.6} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{it.name}</p>
                  <p className="text-[11px] text-muted-foreground/60">Qty {it.quantity} · ${Number(it.price).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery details */}
      <div className="bento-card p-5">
        <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mb-3">Delivery</p>
        <div className="space-y-1 text-[13px]">
          <p className="text-foreground font-medium">{customer.name || "—"}</p>
          <p className="text-muted-foreground">{customer.email || order.guest_email || "—"}</p>
          <p className="text-muted-foreground">{customer.phone || order.guest_phone || "—"}</p>
          {customer.address && <p className="text-muted-foreground">{customer.address}</p>}
        </div>
      </div>
    </div>
  );
}
