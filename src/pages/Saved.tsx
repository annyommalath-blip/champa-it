import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/currency";

export default function Saved() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("saved_products") || "[]");
    if (ids.length === 0) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("products").select("id,name,price,images,category").in("id", ids);
      setItems((data || []).map((p: any) => ({ ...p, image_url: Array.isArray(p.images) ? p.images[0] : null })));
      setLoading(false);
    })();
  }, []);

  const remove = (id: string) => {
    const ids: string[] = JSON.parse(localStorage.getItem("saved_products") || "[]");
    const next = ids.filter((x) => x !== id);
    localStorage.setItem("saved_products", JSON.stringify(next));
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="px-5 py-5 space-y-5 md:max-w-3xl md:mx-auto md:px-8 md:py-8 animate-fade-in">
      <Link to="/profile" className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-page-title text-foreground">Saved Items</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 rounded-2xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.6} />
          </div>
          <p className="text-[14px] text-muted-foreground">No saved items yet</p>
          <Link to="/shop"><button className="btn-primary">Browse shop</button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => (
            <div key={p.id} className="bento-card overflow-hidden">
              <Link to={`/shop/${p.id}`}>
                <div className="aspect-square bg-secondary/40 overflow-hidden">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{p.category}</p>
                  <p className="text-[13px] font-semibold text-foreground line-clamp-2 mt-0.5">{p.name}</p>
                  <p className="text-[13px] font-bold text-foreground mt-1">{formatMoney(p.price, p.currency)}</p>
                </div>
              </Link>
              <button onClick={() => remove(p.id)} className="w-full text-[11px] py-2 text-destructive/70 hover:bg-destructive/5">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
