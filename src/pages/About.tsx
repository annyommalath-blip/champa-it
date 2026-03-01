import { Link } from "react-router-dom";
import { ArrowRight, Search, ChevronRight, Star, ShoppingCart, Zap, Wrench, ShoppingBag, Tag, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image?: string;
}

const defaultHeroSlides: HeroSlide[] = [
  { title: "Enterprise Hardware", subtitle: "Servers, networking & security solutions", cta: "Shop Now", link: "/shop" },
  { title: "Get a Custom Quote", subtitle: "Tailored solutions for your business", cta: "Request Quote", link: "/contact" },
  { title: "Flash Deals", subtitle: "Up to 20% off select products", cta: "View Deals", link: "/shop" },
];

interface DbProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  images: string[] | null;
  in_stock: boolean;
  rating: number | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", LAK: "₭", THB: "฿" };

export default function AboutPage() {
  const { t } = useLanguage();
  
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      const { data } = await supabase.from("settings").select("value").eq("key", "hero_slides").single();
      if (data?.value && Array.isArray(data.value)) {
        setHeroSlides(data.value as unknown as HeroSlide[]);
      }
    }
    loadSlides();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase.from("products").select("id, name, price, currency, category, images, in_stock, rating").order("created_at", { ascending: false }).limit(6);
      setProducts((data as DbProduct[]) || []);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="md:max-w-7xl md:mx-auto">
      {/* ── 1. Greeting ── */}
      <div className="px-5 pt-5 pb-2 md:px-8">
        <p className="text-caption text-muted-foreground font-medium">{greeting} 👋</p>
        <h1 className="text-page-title text-foreground mt-0.5">Discover</h1>
      </div>

      {/* ── 2. Search Bar ── */}
      <div className="px-5 pb-4 md:px-8 sticky top-[52px] md:top-[56px] z-30 bg-background/80 backdrop-blur-xl">
        <Link to="/shop" className="block">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card text-muted-foreground active:scale-[0.99] transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
            <Search className="w-[18px] h-[18px] text-muted-foreground/50" strokeWidth={2} />
            <span className="text-[15px]">Search products & services</span>
          </div>
        </Link>
      </div>

      <div className="px-5 space-y-7 pb-12 md:px-8 md:space-y-9">

        {/* ── 3. Hero Carousel ── */}
        <section>
          <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
            <div className="flex">
              {heroSlides.map((slide, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0">
                  <div className="relative overflow-hidden rounded-2xl flex flex-col justify-end mx-1" style={{ height: "140px" }}>
                    {slide.image ? (
                      <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: i === 0 ? "linear-gradient(135deg, hsl(230 25% 12%), hsl(230 20% 22%))" : i === 1 ? "linear-gradient(135deg, hsl(44 80% 50%), hsl(32 90% 45%))" : "linear-gradient(135deg, hsl(199 70% 35%), hsl(199 80% 45%))" }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    <div className="relative z-10 p-5 flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-[17px] font-bold text-background tracking-tight leading-snug">{slide.title}</h2>
                        <p className="text-[12px] text-background/55 mt-0.5 font-medium">{slide.subtitle}</p>
                      </div>
                      <Link
                        to={slide.link}
                        className="flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-background/15 backdrop-blur-md text-background text-[11px] font-semibold active:scale-95 transition-transform border border-background/10"
                      >
                        {slide.cta} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-3.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "w-6 h-1.5 bg-foreground" : "w-1.5 h-1.5 bg-foreground/12"
                }`}
              />
            ))}
          </div>
        </section>

        {/* ── 5. Top Brands / Partners ── */}
        <section>
          <h3 className="text-section-title text-foreground mb-4">{t("home.trustedPartners")}</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {["Cisco", "AWS", "VMware", "Fortinet", "Microsoft", "Dell"].map((name) => (
              <div key={name} className="flex-shrink-0 w-[72px] h-[72px] rounded-full bg-card flex items-center justify-center active:scale-95 transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
                <span className="text-[11px] font-bold text-muted-foreground tracking-tight text-center leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Featured Products ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-section-title text-foreground">{t("home.featuredProducts")}</h3>
            <Link to="/shop" className="text-[12px] font-bold text-muted-foreground flex items-center gap-0.5 hover:text-foreground transition-colors uppercase tracking-widest">
              All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bento-card overflow-hidden">
                  <div className="aspect-[4/3] skeleton-shimmer" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-2 w-12 skeleton-shimmer rounded-full" />
                    <div className="h-3 w-full skeleton-shimmer rounded" />
                    <div className="h-3.5 w-16 skeleton-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.slice(0, 4).map((product, idx) => {
                const sym = CURRENCY_SYMBOLS[product.currency] || "$";
                const img = product.images?.[0] || null;
                return (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="bento-card overflow-hidden group active:scale-[0.97] transition-transform"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="aspect-[4/3] bg-secondary/60 flex items-center justify-center overflow-hidden relative">
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full" style={{ background: "var(--gradient-mesh)" }}>
                          <span className="text-3xl font-black text-foreground/8">{product.name.charAt(0)}</span>
                        </div>
                      )}
                      {product.in_stock ? (
                        <span className="absolute top-2.5 left-2.5 badge-status bg-success/90 text-success-foreground text-[9px] backdrop-blur-sm">In Stock</span>
                      ) : (
                        <span className="absolute top-2.5 left-2.5 badge-status bg-foreground/70 text-background text-[9px] backdrop-blur-sm">Sold Out</span>
                      )}
                      {/* Cart button */}
                      <button className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h4 className="text-[14px] font-semibold text-foreground line-clamp-2 leading-[1.3] tracking-tight">{product.name}</h4>
                      <div className="flex items-center gap-1 mt-1.5">
                        {product.rating != null && product.rating > 0 && (
                          <>
                            <div className="flex items-center gap-px">
                              {Array.from({ length: 5 }).map((_, si) => (
                                <Star key={si} className={`w-2.5 h-2.5 ${si < Math.round(product.rating!) ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground/60">({product.rating})</span>
                          </>
                        )}
                      </div>
                      <span className="text-[16px] font-extrabold text-foreground tracking-tight mt-2 block">{sym}{Number(product.price).toLocaleString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 7. Quick Actions (Top Offers style) ── */}
        <section>
          <h3 className="text-section-title text-foreground mb-4">Quick Actions</h3>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {[
              { icon: Zap, label: "Get Quote", link: "/contact", gradient: "linear-gradient(135deg, hsl(44 90% 55%), hsl(32 85% 50%))" },
              { icon: Package, label: "Track Order", link: "/profile", gradient: "linear-gradient(135deg, hsl(199 80% 45%), hsl(210 70% 50%))" },
              { icon: ShoppingBag, label: "Browse Shop", link: "/shop", gradient: "linear-gradient(135deg, hsl(152 55% 40%), hsl(160 60% 45%))" },
              { icon: Wrench, label: "Book Service", link: "/services", gradient: "linear-gradient(135deg, hsl(270 50% 50%), hsl(280 55% 55%))" },
              { icon: Tag, label: "Deals", link: "/shop", gradient: "linear-gradient(135deg, hsl(350 70% 50%), hsl(10 80% 55%))" },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.link}
                className="flex-shrink-0 w-[100px] flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl bg-card active:scale-95 transition-transform"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: a.gradient }}>
                  <a.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-semibold text-foreground/80 text-center leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 8. Recently Viewed ── */}
        {products.length > 0 && (
          <section>
            <h3 className="text-section-title text-foreground mb-4">Recently Viewed</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 pb-1">
              {products.slice(0, 5).map((product) => {
                const sym = CURRENCY_SYMBOLS[product.currency] || "$";
                const img = product.images?.[0] || null;
                return (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="flex-shrink-0 w-[130px] active:scale-[0.97] transition-transform"
                  >
                    <div className="aspect-square bg-secondary/60 rounded-2xl flex items-center justify-center overflow-hidden mb-2.5" style={{ boxShadow: "var(--shadow-card)" }}>
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center mesh-gradient">
                          <span className="text-xl font-black text-foreground/8">{product.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-[12px] font-semibold text-foreground line-clamp-1 tracking-tight">{product.name}</h4>
                    <span className="text-[13px] font-extrabold text-foreground mt-0.5 block tracking-tight">{sym}{Number(product.price).toLocaleString()}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
