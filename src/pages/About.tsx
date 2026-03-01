import { Link } from "react-router-dom";
import { ArrowRight, Search, ChevronRight, Star, FileText, Package, Headphones, MessageCircle, Wrench, ShoppingBag, Tag } from "lucide-react";
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
  { title: "New Arrivals", subtitle: "Latest enterprise hardware & tools", cta: "Shop Now", link: "/shop" },
  { title: "Request a Quote", subtitle: "Fast estimate from our sales team", cta: "Get Quote", link: "/contact" },
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

  return (
    <div className="md:max-w-7xl md:mx-auto">
      {/* Sticky Search */}
      <div className="px-5 py-3 md:px-8 sticky top-[52px] md:top-14 z-30 bg-background">
        <Link to="/shop" className="block">
          <div className="flex items-center gap-3 px-4 py-3 rounded-[14px] bg-card border border-border/50 text-muted-foreground active:scale-[0.99] transition-transform">
            <Search className="w-4 h-4" strokeWidth={1.8} />
            <span className="text-body">Search products & services</span>
          </div>
        </Link>
      </div>

      <div className="px-5 space-y-7 pb-10 md:px-8 md:space-y-10">

        {/* ── A) Status Cards Row ── */}
        <section className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
          {[
            { icon: FileText, label: "Quotes", count: 0, link: "/profile" },
            { icon: Package, label: "Orders", count: 0, link: "/profile" },
            { icon: Headphones, label: "Support", count: 0, link: "/chat" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="app-card-interactive flex-shrink-0 flex items-center gap-3.5 px-5 py-4 min-w-[150px]"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.6} />
              <div>
                <p className="text-section-title text-foreground leading-none">{item.count}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* ── B) Hero Carousel ── */}
        <section>
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {heroSlides.map((slide, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 pr-3">
                  <div className="relative overflow-hidden rounded-2xl flex flex-col justify-end" style={{ height: "175px" }}>
                    {slide.image ? (
                      <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 to-foreground/70" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                    <div className="relative z-10 p-5">
                      <h2 className="text-section-title text-background mb-0.5">{slide.title}</h2>
                      <p className="text-caption text-background/70 mb-3">{slide.subtitle}</p>
                      <Link
                        to={slide.link}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-caption font-semibold active:scale-95 transition-transform"
                      >
                        {slide.cta} <ArrowRight className="w-3.5 h-3.5" />
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
                className={`h-1 rounded-full transition-all ${
                  i === selectedIndex ? "w-5 bg-foreground" : "w-1.5 bg-foreground/15"
                }`}
              />
            ))}
          </div>
        </section>

        {/* ── C) Quick Actions — pill row ── */}
        <section>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {[
              { icon: MessageCircle, label: t("home.getQuote"), link: "/contact" },
              { icon: Package, label: "Track Order", link: "/profile" },
              { icon: ShoppingBag, label: "Browse Shop", link: "/shop" },
              { icon: Wrench, label: "Book Service", link: "/services" },
              { icon: Tag, label: t("home.deals"), link: "/shop" },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.link}
                className="chip whitespace-nowrap active:scale-95 transition-transform"
              >
                <a.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                {a.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── D) Featured Products ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section-title text-foreground">{t("home.featuredProducts")}</h3>
            <Link to="/shop" className="text-caption font-medium text-muted-foreground flex items-center gap-0.5 hover:text-foreground transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="app-card overflow-hidden">
                  <div className="aspect-square skeleton-shimmer" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-2.5 w-14 skeleton-shimmer rounded" />
                    <div className="h-3.5 w-full skeleton-shimmer rounded" />
                    <div className="h-3.5 w-20 skeleton-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.slice(0, 4).map((product) => {
                const sym = CURRENCY_SYMBOLS[product.currency] || "$";
                const img = product.images?.[0] || null;
                return (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="app-card-interactive overflow-hidden group"
                  >
                    <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-3xl font-bold text-muted-foreground/20">{product.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-micro text-muted-foreground font-medium uppercase tracking-wider">{product.category}</p>
                      <h4 className="text-caption font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">{product.name}</h4>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-body font-bold text-foreground">{sym}{Number(product.price).toLocaleString()}</span>
                        {product.rating != null && product.rating > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-primary fill-primary" />
                            <span className="text-micro text-muted-foreground">{product.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        {product.in_stock ? (
                          <span className="badge-status bg-success/10 text-success">In Stock</span>
                        ) : (
                          <span className="badge-status bg-destructive/10 text-destructive">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── E) Recently Viewed ── */}
        {products.length > 0 && (
          <section>
            <h3 className="text-section-title text-foreground mb-4">Recently Viewed</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
              {products.slice(0, 4).map((product) => {
                const sym = CURRENCY_SYMBOLS[product.currency] || "$";
                const img = product.images?.[0] || null;
                return (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="app-card-interactive flex-shrink-0 w-[140px] overflow-hidden"
                  >
                    <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
                      {img && img !== "/placeholder.svg" ? (
                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground/20">{product.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-micro font-semibold text-foreground line-clamp-1">{product.name}</h4>
                      <span className="text-caption font-bold text-foreground mt-0.5 block">{sym}{Number(product.price).toLocaleString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Partners ── */}
        <section className="pb-2">
          <h3 className="text-section-title text-foreground mb-3">{t("home.trustedPartners")}</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {["Cisco", "AWS", "VMware", "Fortinet", "Microsoft", "Dell"].map((name) => (
              <span key={name} className="chip">{name}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
