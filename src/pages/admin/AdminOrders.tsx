import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "picked_up"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

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
    else { toast.success(`Order marked as ${status}`); fetchOrders(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...statuses].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono">#{o.id.slice(0, 8)}</CardTitle>
                <Select value={o.status} onValueChange={(val) => updateStatus(o.id, val)}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span>
                <span className="font-bold">${Number(o.total).toFixed(2)}</span>
              </div>
              {o.notes && <p className="text-xs text-muted-foreground mt-2 italic">{o.notes}</p>}
              {o.items && Array.isArray(o.items) && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {(o.items as any[]).length} item(s)
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No orders found.</p>
        )}
      </div>
    </div>
  );
}
