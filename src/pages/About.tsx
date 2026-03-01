import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Wrench, MessageCircle, Tag, Star, ChevronRight, Search, FileText, Package, Headphones } from "lucide-react";
import { products, deals } from "@/data/mock";
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

const partners = ["Cisco", "AWS", "VMware", "Fortinet", "Microsoft", "Dell"];

export default function AboutPage() {
  const { t } = useLanguage();
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    async function loadSlides() {
      const { data } = await supabase.from("settings").select("value").eq("key", "hero_slides").single();
      if (data?.value && Array.isArray(data.value)) {
        setHeroSlides(data.value as unknown as HeroSlide[]);
      }
    }
    loadSlides();
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

  const featuredProducts = products.filter(p => p.category !== "Services").slice(0, 6);
  const dealProducts = deals.map(d => ({ deal: d, product: products.find(p => p.id === d.productId)! })).filter(d => d.product);

  return (
    <div className="md:max-w-7xl md:mx-auto">
      {/* ── Sticky Search ── */}
      <div className="px-5 py-3 md:px-8 sticky top-12 md:top-14 z-30 bg-background">
        <Link to="/shop" className="block">
          <div className="flex items-center gap-3 px-4 py-3 rounded-[14px] bg-card border border-border/60 text-muted-foreground">
            <Search className="w-4 h-4" />
            <span className="text-body">Search products & services</span>
          </div>
        </Link>
      </div>

      <div className="px-5 space-y-6 pb-8 md:px-8 md:space-y-10">

        {/* ── Status Cards Row ── */}
        <section className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
          {[
            { icon: FileText, label: "Quotes", count: 0, color: "text-primary", link: "/profile" },
            { icon: Package, label: "Orders", count: 0, color: "text-foreground/70", link: "/profile" },
            { icon: Headphones, label: "Support", count: 0, color: "text-foreground/70", link: "/chat" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="app-card-interactive flex-shrink-0 flex items-center gap-3 px-4 py-3.5 min-w-[140px]"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.6} />
              <div>
                <p className="text-section-title text-foreground leading-none">{item.count}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* ── Hero Carousel (compact) ── */}
        <section>
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className="flex">
              {heroSlides.map((slide, i) => (
                <div key={i} className="flex-[0_0_100%] min-w-0 pr-2">
                  <div
                    className="relative overflow-hidden rounded-xl flex flex-col justify-end"
                    style={{ height: "170px" }}
                  >
                    {slide.image ? (
                      <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-foreground/90 to-foreground/70" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
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

        {/* ── Quick Actions — pill row ── */}
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
                <a.icon className="w-3.5 h-3.5" />
                {a.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Products — 2-col grid ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-section-title text-foreground">{t("home.featuredProducts")}</h3>
            <Link to="/shop" className="text-caption font-medium text-muted-foreground flex items-center gap-0.5 hover:text-foreground transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuredProducts.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className="app-card-interactive overflow-hidden"
              >
                <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground/30">{product.name.charAt(0)}</span>
                </div>
                <div className="p-3">
                  <p className="text-micro text-muted-foreground font-medium uppercase tracking-wider">{product.category}</p>
                  <h4 className="text-caption font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">{product.name}</h4>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-body font-bold text-foreground">${product.price.toLocaleString()}</span>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-micro text-muted-foreground">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    {product.inStock ? (
                      <span className="badge-status bg-success/10 text-success">In Stock</span>
                    ) : (
                      <span className="badge-status bg-destructive/10 text-destructive">Out of Stock</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Today's Deals ── */}
        {dealProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-section-title text-foreground">{t("home.todaysDeals")}</h3>
              <Link to="/shop" className="text-caption font-medium text-muted-foreground flex items-center gap-0.5">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
              {dealProducts.map(({ deal, product }) => (
                <Link
                  key={deal.id}
                  to={`/shop/${product.id}`}
                  className="app-card-interactive flex-shrink-0 w-[160px] snap-start overflow-hidden"
                >
                  <div className="relative aspect-[4/3] bg-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground/30">{product.name.charAt(0)}</span>
                    {deal.discount > 0 && (
                      <span className="absolute top-2 left-2 badge-pill bg-primary text-primary-foreground">
                        {deal.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-caption font-semibold text-foreground line-clamp-1">{product.name}</h4>
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-body font-bold text-foreground">
                        ${deal.discount > 0 ? Math.round(product.price * (1 - deal.discount / 100)).toLocaleString() : product.price.toLocaleString()}
                      </span>
                      {deal.discount > 0 && (
                        <span className="text-micro text-muted-foreground line-through">${product.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Recently Viewed (placeholder) ── */}
        <section>
          <h3 className="text-section-title text-foreground mb-3">Recently Viewed</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {featuredProducts.slice(0, 3).map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className="app-card-interactive flex-shrink-0 w-[140px] overflow-hidden"
              >
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  <span className="text-xl font-bold text-muted-foreground/25">{product.name.charAt(0)}</span>
                </div>
                <div className="p-2.5">
                  <h4 className="text-micro font-semibold text-foreground line-clamp-1">{product.name}</h4>
                  <span className="text-caption font-bold text-foreground mt-0.5 block">${product.price.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Partners ── */}
        <section className="pb-2">
          <h3 className="text-section-title text-foreground mb-3">{t("home.trustedPartners")}</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
            {partners.map((name) => (
              <span key={name} className="chip">{name}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
