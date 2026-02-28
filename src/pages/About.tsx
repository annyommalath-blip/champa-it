import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Wrench, MessageCircle, Tag, LayoutDashboard, Zap, Star, Users, Clock, TrendingUp, CheckCircle, ChevronRight, Package, FileText, Headphones } from "lucide-react";
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
  { title: "Talk to Sales", subtitle: "Live chat with our engineers", cta: "Start Chat", link: "/contact" },
  { title: "Flash Deals", subtitle: "Up to 20% off select products", cta: "View Deals", link: "/shop" },
];

const partners = ["Cisco", "AWS", "VMware", "Fortinet", "Microsoft", "ISO 27001"];

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

  const quickActions = [
    { icon: ShoppingBag, label: t("nav.shop"), sub: "Browse catalog", link: "/shop" },
    { icon: Wrench, label: t("nav.services"), sub: "IT solutions", link: "/services" },
    { icon: MessageCircle, label: t("home.getQuote"), sub: "Free estimate", link: "/contact" },
    { icon: Tag, label: t("home.deals"), sub: "Save today", link: "/shop" },
    { icon: Headphones, label: t("home.liveChat"), sub: "24/7 support", link: "/contact" },
    { icon: LayoutDashboard, label: t("nav.profile"), sub: "My account", link: "/profile" },
  ];

  const statusStrip = [
    { icon: Package, label: "Track Order", count: 0, link: "/profile" },
    { icon: FileText, label: "My Quotes", count: 0, link: "/profile" },
    { icon: Headphones, label: "Support", count: 0, link: "/contact" },
  ];

  const stats = [
    { num: "500+", label: t("home.stats.clients") },
    { num: "24/7", label: t("home.stats.support") },
    { num: "99.9%", label: t("home.stats.sla") },
    { num: "50+", label: t("home.stats.partners") },
  ];

  const featuredProducts = products.filter(p => p.category !== "Services").slice(0, 6);
  const dealProducts = deals.map(d => ({ deal: d, product: products.find(p => p.id === d.productId)! })).filter(d => d.product);

  return (
    <div className="px-5 py-4 space-y-6 md:max-w-7xl md:mx-auto md:px-8 md:py-6 md:space-y-10">

      {/* ── Status Strip ── */}
      <section className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
        {statusStrip.map((item) => (
          <Link
            key={item.label}
            to={item.link}
            className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all active:scale-95"
          >
            <item.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-caption font-medium text-foreground whitespace-nowrap">{item.label}</span>
            {item.count > 0 && (
              <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1">
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </section>

      {/* ── Hero Carousel ── */}
      <section>
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex">
            {heroSlides.map((slide, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 px-0.5">
                <div className="relative overflow-hidden rounded-2xl min-h-[140px] md:min-h-[220px] flex flex-col justify-end p-5 md:p-8 bg-secondary">
                  {slide.image && (
                    <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  {slide.image && (
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
                  )}
                  {!slide.image && (
                    <div className="absolute top-3 right-3 w-24 h-24 rounded-full bg-primary/8 blur-[40px]" />
                  )}
                  <h2 className={`relative z-10 text-section-title md:text-2xl font-bold mb-1 ${slide.image ? 'text-background' : 'text-foreground'}`}>
                    {slide.title}
                  </h2>
                  <p className={`relative z-10 text-caption mb-3 ${slide.image ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.link}
                    className="relative z-10 self-start btn-primary py-2 px-4 text-caption"
                  >
                    {slide.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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
              className={`h-1.5 rounded-full transition-all ${
                i === selectedIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h3 className="text-section-title text-foreground mb-3">{t("home.quickActions")}</h3>
        <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className="app-card-interactive flex flex-col items-center gap-1.5 py-4 px-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <action.icon className="w-5 h-5 text-foreground/70" />
              </div>
              <span className="text-caption font-medium text-foreground leading-tight">{action.label}</span>
              <span className="text-micro text-muted-foreground hidden md:block">{action.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products — 2-col grid on mobile ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-section-title text-foreground">{t("home.featuredProducts")}</h3>
          <Link to="/shop" className="text-caption font-medium text-primary flex items-center gap-0.5">
            {t("home.more")} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {featuredProducts.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              to={`/shop/${product.id}`}
              className="app-card-interactive overflow-hidden"
            >
              <div className="aspect-square bg-secondary flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{product.name.charAt(0)}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-micro text-muted-foreground font-medium uppercase tracking-wider">{product.category}</p>
                <h4 className="text-caption font-semibold text-foreground mt-0.5 line-clamp-2 leading-snug">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-body font-bold text-foreground">${product.price.toLocaleString()}</span>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-micro text-muted-foreground">{product.rating}</span>
                    </div>
                  )}
                </div>
                {product.inStock ? (
                  <span className="badge-status bg-success/10 text-success mt-2">In Stock</span>
                ) : (
                  <span className="badge-status bg-destructive/10 text-destructive mt-2">Out of Stock</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Services Card ── */}
      <section>
        <Link to="/services" className="app-card-interactive block p-5 md:p-6 relative overflow-hidden">
          <span className="chip chip-active text-micro mb-3">
            <Zap className="w-3 h-3" /> {t("home.6services")}
          </span>
          <h3 className="text-section-title text-foreground mb-1">{t("home.services")}</h3>
          <p className="text-caption text-muted-foreground mb-4">{t("home.servicesDesc")}</p>
          <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary">
            {t("home.learnMore")} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </section>

      {/* ── Today's Deals ── */}
      {dealProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-section-title text-foreground">{t("home.todaysDeals")}</h3>
            <Link to="/shop" className="text-caption font-medium text-primary flex items-center gap-0.5">
              {t("home.more")} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 scrollbar-hide">
            {dealProducts.map(({ deal, product }) => (
              <Link
                key={deal.id}
                to={`/shop/${product.id}`}
                className="app-card-interactive flex-shrink-0 w-40 md:w-48 snap-start overflow-hidden"
              >
                <div className="relative aspect-square bg-secondary flex items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{product.name.charAt(0)}</span>
                  </div>
                  {deal.discount > 0 && (
                    <span className="absolute top-2 left-2 badge-pill bg-primary text-primary-foreground">
                      {deal.discount}% OFF
                    </span>
                  )}
                  {!deal.discount && deal.badge && (
                    <span className="absolute top-2 left-2 badge-pill bg-foreground text-background">
                      {deal.badge}
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
                  {deal.endsIn && <p className="text-micro text-destructive font-semibold mt-1.5">⏰ {deal.endsIn}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="app-card py-4 px-2 text-center">
              <div className="text-section-title md:text-2xl font-extrabold text-foreground">{s.num}</div>
              <div className="text-micro text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="pb-4">
        <h3 className="text-section-title text-foreground mb-3">{t("home.trustedPartners")}</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {partners.map((name) => (
            <span
              key={name}
              className="chip whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
