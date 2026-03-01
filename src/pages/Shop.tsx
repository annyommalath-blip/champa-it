import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Star, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { addToCart } = useApp();
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

  const handleAddToCart = (product: DbProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      longDescription: product.long_description || "",
      price: product.price,
      category: product.category,
      images: product.images || ["/placeholder.svg"],
      specs: (product.specs || {}) as Record<string, string>,
      inStock: product.in_stock,
      rating: product.rating || 0,
    });
  };

  return (
    <div className="md:max-w-7xl md:mx-auto">
      {/* Sticky search */}
      <div className="px-5 py-3 md:px-8 sticky top-[52px] md:top-14 z-30 bg-background">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <input
            type="text"
            placeholder={t("shop.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 md:px-8 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`chip ${category === cat ? "chip-active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 px-5 md:px-8 pb-4">
        <label className="flex items-center gap-2 text-caption text-muted-foreground cursor-pointer select-none">
          <div className={`w-9 h-5 rounded-full transition-colors relative ${stockOnly ? 'bg-primary' : 'bg-border'}`}
            onClick={() => setStockOnly(!stockOnly)}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${stockOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          {t("shop.inStockOnly")}
        </label>
        <button
          onClick={() => setSortPrice(sortPrice === "asc" ? "desc" : sortPrice === "desc" ? null : "asc")}
          className={`chip py-1.5 px-3 ${sortPrice ? 'chip-active' : ''}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
          Sort {sortPrice === "asc" ? "↑" : sortPrice === "desc" ? "↓" : ""}
        </button>
        <span className="ml-auto text-micro text-muted-foreground">
          {filtered.length} {filtered.length !== 1 ? t("shop.products") : t("shop.product")}
        </span>
      </div>

      {/* Product grid */}
      <div className="px-5 md:px-8 pb-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="app-card overflow-hidden">
                <div className="aspect-square skeleton-shimmer" />
                <div className="p-3.5 space-y-2">
                  <div className="h-2.5 w-14 skeleton-shimmer rounded" />
                  <div className="h-3.5 w-full skeleton-shimmer rounded" />
                  <div className="h-3.5 w-2/3 skeleton-shimmer rounded" />
                  <div className="h-3.5 w-16 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-body font-semibold text-foreground mb-1">No products found</p>
            <p className="text-caption text-muted-foreground">{t("shop.noProducts")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product) => {
              const sym = CURRENCY_SYMBOLS[product.currency] || "$";
              const img = product.images?.[0] || null;
              return (
                <div key={product.id} className="app-card overflow-hidden group flex flex-col">
                  <Link to={`/shop/${product.id}`}>
                    <div className="aspect-square bg-secondary flex items-center justify-center relative overflow-hidden">
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-3xl font-bold text-muted-foreground/20">{product.name.charAt(0)}</span>
                      )}
                      {!product.in_stock && (
                        <span className="absolute top-2 right-2 badge-status bg-foreground/80 text-background">Sold Out</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3.5 flex flex-col flex-1">
                    <span className="text-micro text-muted-foreground font-medium uppercase tracking-wider">{product.category}</span>
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="text-caption font-semibold text-foreground leading-snug mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    {product.rating != null && product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-micro text-muted-foreground">{product.rating}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <span className="text-body font-bold text-foreground">{sym}{Number(product.price).toLocaleString()}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
