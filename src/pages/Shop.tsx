import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Star, Plus, ShoppingBag, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", LAK: "₭", THB: "฿" };

interface DbProduct {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  price: number;
  currency: string;
  category: string;
  images: string[] | null;
  in_stock: boolean;
  rating: number | null;
  specs: Record<string, string> | null;
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "All";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [stockOnly, setStockOnly] = useState(false);
  const [sortPrice, setSortPrice] = useState<"asc" | "desc" | null>(null);
  const { addToCart, cart } = useApp();
  const { t } = useLanguage();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      setProducts((data as DbProduct[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (stockOnly && !p.in_stock) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortPrice) list = [...list].sort((a, b) => sortPrice === "asc" ? a.price - b.price : b.price - a.price);
    return list;
  }, [search, category, stockOnly, sortPrice, products]);

  const isInCart = (productId: string) => cart.some((i) => i.product.id === productId);

  const handleAddToCart = (product: DbProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      longDescription: product.long_description || "",
      price: product.price,
      currency: product.currency || "LAK",
      category: product.category,
      images: product.images || ["/placeholder.svg"],
      specs: (product.specs || {}) as Record<string, string>,
      inStock: product.in_stock,
      rating: product.rating || 0,
    });
    toast.success("Added to cart", {
      description: product.name,
      action: { label: "Undo", onClick: () => {} },
    });
  };

  return (
    <div className="md:max-w-7xl md:mx-auto">
      {/* Header */}
      <div className="px-5 pt-4 pb-1 md:px-8">
        <h1 className="text-page-title text-foreground">Shop</h1>
        <p className="text-caption text-muted-foreground/50 mt-0.5">Browse enterprise hardware & solutions</p>
      </div>

      {/* Sticky search */}
      <div className="px-5 py-2.5 md:px-8 sticky top-[48px] md:top-[56px] z-30 bg-background/80 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-muted-foreground/40" strokeWidth={2} />
          <input
            type="text"
            placeholder={t("shop.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11 bg-card text-[14px]"
            style={{ boxShadow: "var(--shadow-card)" }}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 md:px-8 pb-2 pt-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95 tracking-tight ${
                category === cat 
                  ? "bg-foreground text-background" 
                  : "bg-card text-muted-foreground/60"
              }`}
              style={{ boxShadow: category === cat ? "none" : "var(--shadow-xs)" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 px-5 md:px-8 pb-4">
        <button
          onClick={() => setStockOnly(!stockOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-tight transition-all active:scale-95 ${
            stockOnly ? "bg-foreground text-background" : "bg-card text-muted-foreground/50"
          }`}
          style={{ boxShadow: stockOnly ? "none" : "var(--shadow-xs)" }}
        >
          <div className={`w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
            stockOnly ? "border-background bg-background" : "border-muted-foreground/20"
          }`}>
            {stockOnly && <div className="w-1.5 h-1.5 rounded-full bg-foreground" />}
          </div>
          {t("shop.inStockOnly")}
        </button>
        <button
          onClick={() => setSortPrice(sortPrice === "asc" ? "desc" : sortPrice === "desc" ? null : "asc")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-tight transition-all active:scale-95 ${
            sortPrice ? "bg-foreground text-background" : "bg-card text-muted-foreground/50"
          }`}
          style={{ boxShadow: sortPrice ? "none" : "var(--shadow-xs)" }}
        >
          <SlidersHorizontal className="w-3 h-3" strokeWidth={2} />
          Price {sortPrice === "asc" ? "↑" : sortPrice === "desc" ? "↓" : ""}
        </button>
        <span className="ml-auto text-[11px] text-muted-foreground/35 font-semibold tabular-nums">
          {filtered.length} items
        </span>
      </div>

      {/* Product grid */}
      <div className="px-5 md:px-8 pb-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bento-card overflow-hidden">
                <div className="aspect-[4/3] skeleton-shimmer" />
                <div className="p-3.5 space-y-2">
                  <div className="h-2 w-10 skeleton-shimmer rounded-full" />
                  <div className="h-3 w-full skeleton-shimmer rounded" />
                  <div className="h-3 w-14 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4 mesh-gradient">
              <ShoppingBag className="w-6 h-6 text-muted-foreground/20" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-bold text-foreground mb-1 tracking-tight">No products found</p>
            <p className="text-caption text-muted-foreground/60">{t("shop.noProducts")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product, idx) => {
              const sym = CURRENCY_SYMBOLS[product.currency] || "$";
              const img = product.images?.[0] || null;
              const addedToCart = isInCart(product.id);
              return (
                <Link
                  key={product.id}
                  to={`/shop/${product.id}`}
                  className="bento-card overflow-hidden group flex flex-col animate-fade-in active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="aspect-[4/3] bg-secondary/25 flex items-center justify-center relative overflow-hidden">
                    {img && img !== "/placeholder.svg" ? (
                      <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center mesh-gradient">
                        <span className="text-2xl font-black text-foreground/4">{product.name.charAt(0)}</span>
                      </div>
                    )}
                    {/* Stock badge */}
                    {product.in_stock ? (
                      <span className="absolute top-2 left-2 badge-status bg-success/90 text-success-foreground text-[9px] backdrop-blur-sm">In Stock</span>
                    ) : (
                      <span className="absolute top-2 left-2 badge-status bg-foreground/70 text-background text-[9px] backdrop-blur-sm">Sold Out</span>
                    )}
                    {/* Quick add button */}
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!product.in_stock}
                      className={`absolute bottom-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-md disabled:opacity-20 ${
                        addedToCart ? "bg-success" : "bg-foreground/90"
                      }`}
                    >
                      {addedToCart ? (
                        <Check className="w-3 h-3 text-success-foreground" strokeWidth={3} />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <span className="text-[9px] text-muted-foreground/35 font-bold uppercase tracking-[0.1em]">{product.category}</span>
                    <h3 className="text-[13px] font-semibold text-foreground leading-[1.3] mt-0.5 line-clamp-2 tracking-tight">{product.name}</h3>
                    {product.rating != null && product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                        <span className="text-[10px] text-muted-foreground/40 font-medium">{product.rating}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-[15px] font-extrabold text-foreground tracking-tight">{sym}{Number(product.price).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
