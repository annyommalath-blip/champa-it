import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { products } from "@/data/mock";
import { useApp } from "@/context/AppContext";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const { addToCart } = useApp();

  if (!product) {
    return (
      <div className="section-padding text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="text-accent mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="glass-card aspect-square flex items-center justify-center bg-muted/30">
            <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="gradient-text font-bold text-6xl">{product.name.charAt(0)}</span>
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="badge-pill bg-muted text-muted-foreground">{product.category}</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground text-sm">• {product.inStock ? "In Stock" : "Out of Stock"}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{product.longDescription}</p>

            <div className="text-3xl font-bold mb-6">
              ${product.price.toLocaleString()}
              {product.category === "Software" && <span className="text-base font-normal text-muted-foreground">/mo</span>}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => addToCart(product, qty)}
              disabled={!product.inStock}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all glow-border disabled:opacity-40 inline-flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart — ${(product.price * qty).toLocaleString()}
            </button>

            {/* Specs */}
            <div className="mt-8">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <div className="space-y-0">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2.5 border-b border-border text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
