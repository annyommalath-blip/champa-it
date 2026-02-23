import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Star, Server, Shield, Wifi, HardDrive, Zap, Monitor, Wrench } from "lucide-react";
import { products, categories } from "@/data/mock";
import { useApp } from "@/context/AppContext";

const categoryIcons: Record<string, any> = {
  Servers: Server, Security: Shield, Networking: Wifi, Storage: HardDrive, Power: Zap, Software: Monitor, Services: Wrench,
};

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "All";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [stockOnly, setStockOnly] = useState(false);
  const [sortPrice, setSortPrice] = useState<"asc" | "desc" | null>(null);
  const { addToCart } = useApp();

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (stockOnly && !p.inStock) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortPrice) list = [...list].sort((a, b) => sortPrice === "asc" ? a.price - b.price : b.price - a.price);
    return list;
  }, [search, category, stockOnly, sortPrice]);

  return (
    <div>
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-8 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
          <p className="text-muted-foreground">Browse enterprise hardware, software, and service packages.</p>
        </div>
      </div>

      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 mb-6 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="accent-primary rounded" />
              In Stock Only
            </label>
            <button onClick={() => setSortPrice(sortPrice === "asc" ? "desc" : "asc")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-4 h-4" />
              Price {sortPrice === "asc" ? "↑" : sortPrice === "desc" ? "↓" : ""}
            </button>
            <span className="ml-auto text-muted-foreground">{filtered.length} product{filtered.length !== 1 && "s"}</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <div key={product.id} className="glass-card overflow-hidden group flex flex-col">
                <Link to={`/shop/${product.id}`}>
                  <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="gradient-text font-bold text-2xl">{product.name.charAt(0)}</span>
                    </div>
                    {!product.inStock && (
                      <span className="absolute top-2 right-2 badge-pill bg-destructive/10 text-destructive">Out of Stock</span>
                    )}
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-muted-foreground mb-1">{product.category}</span>
                  <Link to={`/shop/${product.id}`}>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-accent transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-lg font-bold">${product.price.toLocaleString()}{product.category === "Software" && <span className="text-xs font-normal text-muted-foreground">/mo</span>}</span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">No products found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
}
