import { Link } from "react-router-dom";
import { ArrowRight, Search, ChevronRight, Star, ShoppingCart, Zap, Wrench, ShoppingBag, Tag, Package, Sparkles, Server, Shield, Cloud, Cpu, HardDrive, Wifi, Heart } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { useApp } from "@/context/AppContext";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image?: string;
  imagePosition?: string;
}

const defaultHeroSlides: HeroSlide[] = [
  { title: "Enterprise Hardware", subtitle: "Servers, networking & security solutions", cta: "Shop Now", link: "/shop" },
  { title: "Get a Custom Quote", subtitle: "Tailored solutions for your business", cta: "Request Quote", link: "/contact" },
  { title: "Flash Deals", subtitle: "Up to 20% off select products", cta: "View Deals", link: "/shop" },
];

interface DbProduct {
  id: string;
  name: string;
  description: string;
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
  const { addToCart } = useApp();
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
      const { data } = await supabase.from("products").select("id, name, description, price, currency, category, images, in_stock, rating").order("created_at", { ascending: false }).limit(16);
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

  const handleQuickAdd = (product: DbProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || "",
      longDescription: "",
      price: product.price,
      category: product.category,
      images: product.images || ["/placeholder.svg"],
      specs: {},
      inStock: product.in_stock,
      rating: product.rating || 0,
    });
    toast.success(`Added to cart`, {
      description: product.name,
      action: { label: "Undo", onClick: () => {} },
    });
  };

  return (
    <div className="md:max-w-7xl md:mx-auto">

      {/* Search moved into the yellow home header on mobile */}
      <div className="hidden md:block px-5 pb-4 md:px-8 sticky top-[56px] z-30 bg-background/80 backdrop-blur-xl pt-2">
        <Link to="/shop" className="block">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card text-muted-foreground active:scale-[0.99] transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
            <Search className="w-[17px] h-[17px] text-muted-foreground/40" strokeWidth={2} />
            <span className="text-[14px] text-muted-foreground/50">Search products & services</span>
          </div>
        </Link>
      </div>


      <div className="px-5 space-y-6 pb-10 md:px-8 md:space-y-8 pt-5 md:pt-2">

        {/* ── Hero Carousel ── */}
        <section>
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {heroSlides.map((slide, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0">
                  <div className="relative overflow-hidden rounded-2xl flex flex-col justify-end mx-0.5" style={{ height: "150px" }}>
                    {slide.image ? (
                      <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: slide.imagePosition || "center" }} />
                    ) : (
                      <div className="absolute inset-0" style={{ background: i === 0 ? "linear-gradient(135deg, hsl(228 24% 10%), hsl(228 20% 22%))" : i === 1 ? "linear-gradient(135deg, hsl(44 80% 50%), hsl(32 90% 45%))" : "linear-gradient(135deg, hsl(199 70% 35%), hsl(199 80% 45%))" }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 to-transparent" />
                    <div className="relative z-10 p-5 flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-[16px] font-bold text-background tracking-tight leading-snug">{slide.title}</h2>
                        <p className="text-[12px] text-background/50 mt-0.5 font-medium">{slide.subtitle}</p>
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
          <div className="flex justify-center gap-1.5 mt-3">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "w-5 h-1.5 bg-foreground" : "w-1.5 h-1.5 bg-foreground/10"
                }`}
              />
            ))}
          </div>
        </section>

        {/* ── Quick Actions (pill row) ── */}
        <section>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {[
              { icon: Zap, label: "Get Quote", link: "/contact" },
              { icon: Package, label: "Track Order", link: "/profile" },
              { icon: ShoppingBag, label: "Browse Shop", link: "/shop" },
              { icon: Wrench, label: "Book Service", link: "/services" },
              { icon: Tag, label: "Deals", link: "/shop" },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.link}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-card text-foreground/80 text-[12px] font-semibold active:scale-95 transition-transform tracking-tight"
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <a.icon className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={2} />
                {a.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Trusted Partners ── */}
        <section>
          <h3 className="text-section-title text-foreground mb-3">{t("home.trustedPartners")}</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {[
              { name: "Cisco", logo: "/brands/cisco.svg" },
              { name: "AWS", logo: "/brands/aws.svg" },
              { name: "VMware", logo: "/brands/vmware.png" },
              { name: "Fortinet", logo: "/brands/fortinet.svg" },
              { name: "Microsoft", logo: "/brands/microsoft.svg" },
              { name: "Dell", logo: "/brands/dell.svg" },
            ].map((brand) => (
              <div key={brand.name} className="flex-shrink-0 w-[64px] h-[64px] rounded-2xl bg-card flex items-center justify-center p-3 active:scale-95 transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section-title text-foreground">{t("home.featuredProducts")}</h3>
            <Link to="/shop" className="text-[11px] font-bold text-muted-foreground/50 flex items-center gap-0.5 hover:text-foreground transition-colors uppercase tracking-widest">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bento-card overflow-hidden">
                  <div className="aspect-[4/3] skeleton-shimmer" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-2 w-10 skeleton-shimmer rounded-full" />
                    <div className="h-3 w-full skeleton-shimmer rounded" />
                    <div className="h-3 w-16 skeleton-shimmer rounded" />
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
                    className="bento-card overflow-hidden group active:scale-[0.98] transition-transform animate-fade-in"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden relative">
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full mesh-gradient">
                          <span className="text-2xl font-black text-foreground/5">{product.name.charAt(0)}</span>
                        </div>
                      )}
                      {product.in_stock ? (
                        <span className="absolute top-2 left-2 badge-status bg-success/90 text-success-foreground text-[9px] backdrop-blur-sm">In Stock</span>
                      ) : (
                        <span className="absolute top-2 left-2 badge-status bg-foreground/70 text-background text-[9px] backdrop-blur-sm">Sold Out</span>
                      )}
                      <button
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-xl bg-foreground/90 flex items-center justify-center active:scale-90 transition-transform shadow-md"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickAdd(product); }}
                      >
                        <ShoppingCart className="w-3 h-3 text-background" strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.1em]">{product.category}</span>
                      <h4 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-[1.3] tracking-tight mt-0.5">{product.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {product.rating != null && product.rating > 0 && (
                          <>
                            <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                            <span className="text-[10px] text-muted-foreground/50">{product.rating}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[15px] font-extrabold text-foreground tracking-tight mt-1.5 block">{sym}{Number(product.price).toLocaleString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Recently Viewed ── */}
        {products.length > 4 && (
          <section>
            <h3 className="text-section-title text-foreground mb-3">Recently Viewed</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 pb-1">
              {products.slice(4, 8).map((product) => {
                const sym = CURRENCY_SYMBOLS[product.currency] || "$";
                const img = product.images?.[0] || null;
                return (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="flex-shrink-0 w-[120px] active:scale-[0.97] transition-transform"
                  >
                    <div className="aspect-square bg-secondary/40 rounded-2xl flex items-center justify-center overflow-hidden mb-2" style={{ boxShadow: "var(--shadow-card)" }}>
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center mesh-gradient">
                          <span className="text-lg font-black text-foreground/5">{product.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-[11px] font-semibold text-foreground line-clamp-1 tracking-tight">{product.name}</h4>
                    <span className="text-[12px] font-bold text-foreground/70 mt-0.5 block tracking-tight">{sym}{Number(product.price).toLocaleString()}</span>
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
