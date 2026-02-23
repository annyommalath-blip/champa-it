import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { products } from "@/data/mock";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const { addToCart } = useApp();
  const { t } = useLanguage();

  if (!product) {
    return (
      <div className="section-padding text-center">
        <p className="text-muted-foreground">{t("product.notFound")}</p>
        <Link to="/shop" className="text-primary mt-4 inline-block">{t("product.backToShop")}</Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> {t("product.backToShop")}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="tech-card aspect-square flex items-center justify-center bg-secondary/20">
            <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="gradient-text font-bold text-6xl">{product.name.charAt(0)}</span>
            </div>
          </div>

          <div>
            <span className="badge-pill bg-secondary text-muted-foreground text-[10px] uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl font-bold mt-3 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground text-sm">• {product.inStock ? t("product.inStock") : t("product.outOfStock")}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{product.longDescription}</p>

            <div className="text-3xl font-bold mb-6">
              ${product.price.toLocaleString()}
              {product.category === "Software" && <span className="text-base font-normal text-muted-foreground">/mo</span>}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">{t("product.quantity")}</span>
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
              onClick={() => addToCart(product, qty)}
              disabled={!product.inStock}
              className="btn-primary w-full justify-center disabled:opacity-40"
            >
              <ShoppingCart className="w-4 h-4" />
              {t("product.addToCart")} — ${(product.price * qty).toLocaleString()}
            </button>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">{t("product.specifications")}</h3>
              <div className="space-y-0">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2.5 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium font-mono text-xs">{val}</span>
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
