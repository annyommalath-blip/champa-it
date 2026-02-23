import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star } from "lucide-react";
import { products, categories } from "@/data/mock";
import { useApp } from "@/context/AppContext";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
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
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Shop</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-6 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="accent-primary" />
            In Stock Only
          </label>
          <button onClick={() => setSortPrice(sortPrice === "asc" ? "desc" : "asc")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" />
            Price {sortPrice === "asc" ? "↑" : sortPrice === "desc" ? "↓" : ""}
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="glass-card rounded-xl overflow-hidden group">
              <Link to={`/shop/${product.id}`}>
                <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-2xl">{product.name.charAt(0)}</span>
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{product.category}</span>
                  {!product.inStock && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Out of Stock</span>}
                </div>
                <Link to={`/shop/${product.id}`}>
                  <h3 className="font-semibold text-lg mt-2 group-hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold">${product.price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
  );
}
