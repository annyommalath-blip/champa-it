import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingCart, Share2, ChevronDown, ChevronRight, Package, Shield, Truck, Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useEmblaCarousel from "embla-carousel-react";
import { formatMoney } from "@/lib/currency";



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

/* ── Expandable Section ── */
function ExpandableSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/20">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left active:opacity-70 transition-opacity"
      >
        <span className="text-[14px] font-semibold text-foreground tracking-tight">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[600px] pb-4" : "max-h-0"}`}>
        {children}
      </div>
    </div>
  );
}

/* ── Image Gallery ── */
function ProductGallery({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIdx, setSelectedIdx] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-secondary/30 flex items-center justify-center mesh-gradient">
        <Package className="w-12 h-12 text-muted-foreground/10" strokeWidth={1.2} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-square bg-secondary/20 flex items-center justify-center overflow-hidden">
                {img && img !== "/placeholder.svg" ? (
                  <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center mesh-gradient">
                    <Package className="w-12 h-12 text-muted-foreground/10" strokeWidth={1.2} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIdx ? "w-5 h-1.5 bg-foreground" : "w-1.5 h-1.5 bg-foreground/10"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Recommended Product Card ── */
function RecommendedCard({ product }: { product: DbProduct }) {
  
  const img = product.images?.[0] || null;
  return (
    <Link
      to={`/shop/${product.id}`}
      className="active:scale-[0.97] transition-transform"
    >
      <div className="aspect-square bg-secondary/30 rounded-2xl overflow-hidden mb-2" style={{ boxShadow: "var(--shadow-card)" }}>
        {img && img !== "/placeholder.svg" ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center mesh-gradient">
            <span className="text-lg font-black text-foreground/5">{product.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <h4 className="text-[12px] font-semibold text-foreground line-clamp-2 tracking-tight leading-[1.3]">{product.name}</h4>
      <span className="text-[13px] font-bold text-foreground mt-0.5 block tracking-tight">{formatMoney(product.price, product.currency)}</span>
    </Link>
  );
}

/* ── Main Page ── */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, updateQuantity } = useApp();
  const { t } = useLanguage();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<DbProduct[]>([]);
  const [moreFromCategory, setMoreFromCategory] = useState<DbProduct[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      setProduct(data as DbProduct | null);
      setLoading(false);

      if (data) {
        // Load related (same category)
        const { data: catProducts } = await supabase
          .from("products")
          .select("id, name, description, long_description, price, currency, category, images, in_stock, rating, specs")
          .eq("category", (data as DbProduct).category)
          .neq("id", id!)
          .limit(6);
        setMoreFromCategory((catProducts as DbProduct[]) || []);

        // Load more products (different category)
        const { data: otherProducts } = await supabase
          .from("products")
          .select("id, name, description, long_description, price, currency, category, images, in_stock, rating, specs")
          .neq("id", id!)
          .neq("category", (data as DbProduct).category)
          .order("created_at", { ascending: false })
          .limit(6);
        setRelated((otherProducts as DbProduct[]) || []);
      }
    }
    load();
  }, [id]);

  // Check if already in cart
  const cartItem = cart.find((i) => i.product.id === id);
  const inCart = !!cartItem;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || "",
      longDescription: product.long_description || "",
      price: product.price,
      currency: product.currency || "LAK",
      category: product.category,
      images: product.images || ["/placeholder.svg"],
      specs: (product.specs || {}) as Record<string, string>,
      inStock: product.in_stock,
      rating: product.rating || 0,
    }, qty);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="aspect-square skeleton-shimmer" />
        <div className="px-5 py-5 space-y-3">
          <div className="h-3 w-16 skeleton-shimmer rounded-full" />
          <div className="h-5 w-3/4 skeleton-shimmer rounded" />
          <div className="h-4 w-1/3 skeleton-shimmer rounded" />
          <div className="h-12 w-full skeleton-shimmer rounded-2xl mt-4" />
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="px-5 py-20 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <Package className="w-6 h-6 text-muted-foreground/20" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-bold text-foreground mb-1 tracking-tight">{t("product.notFound")}</p>
        <p className="text-caption text-muted-foreground/60 mb-6">This product doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/shop")} className="btn-secondary">
          {t("product.backToShop")}
        </button>
      </div>
    );
  }

  
  const images = (product.images || []).filter(img => img && img !== "/placeholder.svg");
  const specs = product.specs || {};
  const hasSpecs = Object.keys(specs).length > 0;

  return (
    <div className="animate-fade-in pb-8">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-[48px] md:top-[56px] z-40 glass-header border-b border-border/20 px-4 h-[44px] flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
        </button>
        <button onClick={handleShare} className="p-2 rounded-xl active:scale-90 transition-transform">
          <Share2 className="w-[18px] h-[18px] text-foreground/50" strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Image Gallery ── */}
      <ProductGallery images={images.length > 0 ? images : ["/placeholder.svg"]} />

      {/* ── Product Info ── */}
      <div className="px-5 pt-5 md:px-8 md:max-w-3xl md:mx-auto">
        {/* Category + Rating */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">{product.category}</span>
          {product.rating != null && product.rating > 0 && (
            <>
              <span className="text-muted-foreground/20">·</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-primary" />
                <span className="text-[11px] font-semibold text-foreground/70">{product.rating}</span>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold text-foreground tracking-tight leading-[1.2] mb-3">{product.name}</h1>

        {/* Price + Stock */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[24px] font-extrabold text-foreground tracking-tight">{formatMoney(product.price, product.currency)}</span>
          {product.in_stock ? (
            <span className="badge-status bg-success/10 text-success text-[10px]">
              <Check className="w-2.5 h-2.5" /> In Stock
            </span>
          ) : (
            <span className="badge-status bg-destructive/10 text-destructive text-[10px]">Out of Stock</span>
          )}
        </div>

        {/* About this item (short description) */}
        {product.description && (
          <div className="mb-5">
            <p className="text-[13px] text-muted-foreground/70 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Quick highlights */}
        <div className="flex items-center gap-4 mb-6 py-3 border-y border-border/15">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Truck className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Free shipping</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Shield className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>1-year warranty</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Package className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Easy returns</span>
          </div>
        </div>

        {/* ── Purchase Section ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform text-foreground/60"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <span className="w-7 text-center text-[14px] font-bold text-foreground tabular-nums">{inCart ? cartItem!.quantity : qty}</span>
            <button
              onClick={() => {
                if (inCart) {
                  updateQuantity(id!, cartItem!.quantity + 1);
                } else {
                  setQty(qty + 1);
                }
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform text-foreground/60"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`flex-1 py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              inCart
                ? "bg-success text-success-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4" /> Added · {formatMoney(product.price * cartItem!.quantity, product.currency)}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" strokeWidth={2} /> Add to Cart · {formatMoney(product.price * qty, product.currency)}
              </>
            )}
          </button>
        </div>

        {/* ── Expandable Sections ── */}
        {product.long_description && (
          <ExpandableSection title="Description" defaultOpen>
            <p className="text-[13px] text-muted-foreground/60 leading-relaxed">{product.long_description}</p>
          </ExpandableSection>
        )}

        {hasSpecs && (
          <ExpandableSection title="Specifications">
            <div className="space-y-0">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2 text-[13px]">
                  <span className="text-muted-foreground/50">{key}</span>
                  <span className="font-medium text-foreground text-right max-w-[55%]">{val}</span>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}

        <ExpandableSection title="Shipping & Returns">
          <div className="space-y-2 text-[13px] text-muted-foreground/60 leading-relaxed">
            <p>Free standard shipping on all orders over $500. Express shipping available at checkout.</p>
            <p>30-day return policy for unused items in original packaging. Contact support for RMA authorization.</p>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Warranty & Support">
          <div className="space-y-2 text-[13px] text-muted-foreground/60 leading-relaxed">
            <p>All products include a standard 1-year manufacturer warranty. Extended warranties available.</p>
            <p>For support, contact us via the Chat tab or email support@champa.la</p>
          </div>
        </ExpandableSection>

        {/* ── More from category ── */}
        {moreFromCategory.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-section-title text-foreground">More in {product.category}</h3>
              <Link to={`/shop?cat=${encodeURIComponent(product.category)}`} className="text-[11px] font-bold text-muted-foreground/40 flex items-center gap-0.5 uppercase tracking-widest">
                All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 pb-1 snap-x snap-mandatory">
              {moreFromCategory.map((p) => <div key={p.id} className="flex-shrink-0 w-[160px] snap-start"><RecommendedCard product={p} /></div>)}
            </div>
          </section>
        )}

        {/* ── You may also like ── */}
        {related.length > 0 && (
          <section className="mt-8">
            <h3 className="text-section-title text-foreground mb-3">You may also like</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 pb-1 snap-x snap-mandatory">
              {related.map((p) => <div key={p.id} className="flex-shrink-0 w-[160px] snap-start"><RecommendedCard product={p} /></div>)}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}
