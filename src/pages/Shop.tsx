import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Star, Server, Shield, Wifi, HardDrive, Zap, Monitor, Wrench, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InlineProductEditor from "@/components/InlineProductEditor";

const categoryIcons: Record<string, any> = {
  Servers: Server, Security: Shield, Networking: Wifi, Storage: HardDrive, Power: Zap, Software: Monitor, Services: Wrench,
};

interface DBProduct {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  price: number;
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
  const { role } = useAuth();
  const isAdmin = role === "approved_admin" || role === "super_admin";

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    const prods = (data as DBProduct[]) || [];
    setProducts(prods);
    const cats = ["All", ...Array.from(new Set(prods.map((p) => p.category)))];
    setCategories(cats);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const openEdit = (p: DBProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProduct({
      id: p.id, name: p.name, description: p.description, long_description: p.long_description || "",
      price: p.price, category: p.category, images: p.images || [],
      in_stock: p.in_stock, rating: p.rating || 0, specs: (p.specs || {}) as Record<string, string>,
    });
    setEditorOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Product deleted"); fetchProducts(); }
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (stockOnly && !p.in_stock) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sortPrice) list = [...list].sort((a, b) => sortPrice === "asc" ? a.price - b.price : b.price - a.price);
    return list;
  }, [products, search, category, stockOnly, sortPrice]);

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-10 md:px-8 hero-section">
        <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop</h1>
            <p className="text-muted-foreground">Browse enterprise hardware, software, and service packages.</p>
          </div>
          {isAdmin && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Create Product
            </Button>
          )}
        </div>
      </div>

      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}>
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 mb-8 text-sm">
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
              <div key={product.id} className="tech-card overflow-hidden group flex flex-col relative">
                {/* Admin controls */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => openEdit(product, e)} className="w-8 h-8 rounded-lg bg-background/90 border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors" title="Edit">
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                    </button>
                    <button onClick={(e) => handleDelete(product.id, e)} className="w-8 h-8 rounded-lg bg-background/90 border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                )}

                <Link to={`/shop/${product.id}`}>
                  <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center relative">
                    {product.images?.[0] && product.images[0] !== "/placeholder.svg" ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="gradient-text font-bold text-2xl">{product.name.charAt(0)}</span>
                      </div>
                    )}
                    {!product.in_stock && (
                      <span className="absolute top-2 right-2 badge-pill bg-destructive/20 text-destructive text-[10px]">Out of Stock</span>
                    )}
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.category}</span>
                  <Link to={`/shop/${product.id}`}>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-xs font-medium">{product.rating ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-lg font-bold">${Number(product.price).toLocaleString()}{product.category === "Software" && <span className="text-[10px] font-normal text-muted-foreground">/mo</span>}</span>
                    <button
                      onClick={() => addToCart({ ...product, longDescription: product.long_description || "", images: product.images || [], specs: (product.specs || {}) as Record<string, string>, rating: product.rating ?? 0, inStock: product.in_stock })}
                      disabled={!product.in_stock}
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

      <InlineProductEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        product={editingProduct}
        onSaved={fetchProducts}
      />
    </div>
  );
}
