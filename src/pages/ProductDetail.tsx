import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingCart, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import InlineProductEditor from "@/components/InlineProductEditor";

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

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useApp();
  const { role } = useAuth();
  const isAdmin = role === "approved_admin" || role === "super_admin";
  const [editorOpen, setEditorOpen] = useState(false);

  const fetchProduct = async () => {
    const { data } = await supabase.from("products").select("*").eq("id", id).single();
    setProduct(data as DBProduct | null);
    setLoading(false);
  };

  useEffect(() => { fetchProduct(); }, [id]);

  if (loading) {
    return <div className="section-padding text-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!product) {
    return (
      <div className="section-padding text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="text-primary mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const cartProduct = {
    ...product,
    longDescription: product.long_description || "",
    images: product.images || [],
    specs: (product.specs || {}) as Record<string, string>,
    rating: product.rating ?? 0,
    inStock: product.in_stock,
  };

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          {isAdmin && (
            <button
              onClick={() => setEditorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit Product
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="tech-card aspect-square flex items-center justify-center bg-secondary/20 overflow-hidden">
            {product.images?.[0] && product.images[0] !== "/placeholder.svg" ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="gradient-text font-bold text-6xl">{product.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div>
            <span className="badge-pill bg-secondary text-muted-foreground text-[10px] uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="font-medium">{product.rating ?? 0}</span>
              <span className="text-muted-foreground text-sm">• {product.in_stock ? "In Stock" : "Out of Stock"}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{product.long_description || product.description}</p>

            <div className="text-3xl font-bold mb-6">
              ${Number(product.price).toLocaleString()}
              {product.category === "Software" && <span className="text-base font-normal text-muted-foreground">/mo</span>}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => addToCart(cartProduct, qty)}
              disabled={!product.in_stock}
              className="btn-primary w-full justify-center disabled:opacity-40"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart — ${(Number(product.price) * qty).toLocaleString()}
            </button>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <div className="space-y-0">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2.5 border-b border-border/50 text-sm">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium font-mono text-xs">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <InlineProductEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        product={{
          id: product.id, name: product.name, description: product.description,
          long_description: product.long_description || "", price: product.price,
          category: product.category, images: product.images || [],
          in_stock: product.in_stock, rating: product.rating ?? 0,
          specs: (product.specs || {}) as Record<string, string>,
        }}
        onSaved={fetchProduct}
      />
    </div>
  );
}
