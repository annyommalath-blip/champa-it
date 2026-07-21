import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Package, ClipboardCheck, Truck, Home, ChevronDown, ChevronUp, XCircle } from "lucide-react";

type Stage = {
  key: string;
  label: string;
  customerLabel: string;
  icon: typeof Check;
};

const STAGES: Stage[] = [
  { key: "pending", label: "Pending", customerLabel: "Order placed", icon: ClipboardCheck },
  { key: "confirmed", label: "Confirmed", customerLabel: "Store confirmed your order", icon: Check },
  { key: "processing", label: "Preparing", customerLabel: "Store is preparing your order", icon: Package },
  { key: "shipped", label: "Shipped", customerLabel: "Store has shipped your order", icon: Truck },
  { key: "delivered", label: "Delivered", customerLabel: "Order delivered", icon: Home },
];

const stageIndex = (key: string) => STAGES.findIndex((s) => s.key === key);

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = async () => {
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setOrders(data || []);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      const stage = STAGES.find((s) => s.key === status);
      toast.success(stage ? `Marked as "${stage.label}"` : `Updated to ${status}`);
      fetchOrders();
    }
  };

  const filters = [{ key: "all", label: "All" }, ...STAGES.map((s) => ({ key: s.key, label: s.label })), { key: "cancelled", label: "Cancelled" }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const currentIdx = stageIndex(o.status);
          const cancelled = o.status === "cancelled";
          const nextStage = !cancelled && currentIdx >= 0 && currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;
          const customer = o.customer_info || {};
          const isOpen = expanded === o.id;
          const items = Array.isArray(o.items) ? o.items : [];

          return (
            <Card key={o.id}>
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.name || o.guest_email || "Guest"} · {new Date(o.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.delivery_method || "—"} · {items.length} item{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${Number(o.total).toFixed(2)}</p>
                    {cancelled && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full mt-1"><XCircle className="w-3 h-3" />Cancelled</span>}
                  </div>
                </div>

                {/* Stage stepper */}
                {!cancelled && (
                  <div className="flex items-center gap-1">
                    {STAGES.map((s, i) => {
                      const done = currentIdx >= i;
                      const active = currentIdx === i;
                      const Icon = s.icon;
                      return (
                        <div key={s.key} className="flex-1 flex items-center gap-1">
                          <button
                            onClick={() => updateStatus(o.id, s.key)}
                            title={`Mark as ${s.label}`}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                              done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                            } ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                          >
                            <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                          </button>
                          {i < STAGES.length - 1 && <div className={`h-0.5 flex-1 rounded-full ${currentIdx > i ? "bg-primary" : "bg-secondary"}`} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Current status label */}
                {!cancelled && currentIdx >= 0 && (
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="font-semibold text-foreground">{STAGES[currentIdx].label}</span> — customer sees "{STAGES[currentIdx].customerLabel}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {nextStage && (
                    <Button size="sm" onClick={() => updateStatus(o.id, nextStage.key)} className="gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Mark as {nextStage.label}
                    </Button>
                  )}
                  {!cancelled && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "cancelled")} className="text-destructive">
                      Cancel order
                    </Button>
                  )}
                  {cancelled && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "pending")}>
                      Reopen
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(isOpen ? null : o.id)} className="ml-auto gap-1">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Details
                  </Button>
                </div>

                {/* Details */}
                {isOpen && (
                  <div className="border-t pt-3 space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Customer</p>
                      <p className="text-muted-foreground">{customer.name || "—"}</p>
                      <p className="text-muted-foreground">{customer.email || o.guest_email || "—"}</p>
                      <p className="text-muted-foreground">{customer.phone || o.guest_phone || "—"}</p>
                      {customer.address && <p className="text-muted-foreground">{customer.address}</p>}
                    </div>
                    {items.length > 0 && (
                      <div>
                        <p className="font-semibold text-foreground mb-1">Items</p>
                        <ul className="space-y-1">
                          {items.map((it: any, idx: number) => (
                            <li key={idx} className="flex justify-between text-muted-foreground">
                              <span>{it.name || it.title || "Item"} × {it.quantity || 1}</span>
                              <span>${Number(it.price || 0).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {o.notes && (
                      <div>
                        <p className="font-semibold text-foreground mb-1">Notes</p>
                        <p className="text-muted-foreground italic">{o.notes}</p>
                      </div>
                    )}
                    {o.payment_screenshot && (
                      <div>
                        <p className="font-semibold text-foreground mb-1">Payment proof</p>
                        <a href={o.payment_screenshot} target="_blank" rel="noreferrer" className="text-primary underline">View screenshot</a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {orders.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
}
