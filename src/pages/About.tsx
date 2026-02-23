import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Wrench, MessageCircle, LayoutDashboard, Zap, Tag, Star, Users, Clock, TrendingUp, CheckCircle, ChevronRight } from "lucide-react";
import { products, deals } from "@/data/mock";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

const heroSlides = [
  { title: "New Arrivals", subtitle: "Latest enterprise hardware & tools", cta: "Shop Now", link: "/shop" },
  { title: "Request a Quote", subtitle: "Fast estimate from our sales team", cta: "Get Quote", link: "/contact" },
  { title: "Talk to Sales", subtitle: "Live chat with our engineers", cta: "Start Chat", link: "/contact" },
  { title: "Flash Deals", subtitle: "Up to 20% off select products", cta: "View Deals", link: "/shop" },
];

const quickActions = [
  { icon: ShoppingBag, label: "Shop", link: "/shop" },
  { icon: Wrench, label: "Services", link: "/services" },
  { icon: MessageCircle, label: "Get Quote", link: "/contact" },
  { icon: MessageCircle, label: "Live Chat", link: "/contact" },
  { icon: Tag, label: "Deals", link: "/shop" },
  { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
];

const stats = [
  { num: "500+", label: "Clients", icon: Users },
  { num: "24/7", label: "Support", icon: Clock },
  { num: "99.9%", label: "SLA", icon: TrendingUp },
  { num: "50+", label: "Partners", icon: CheckCircle },
];

const partners = ["Cisco", "AWS", "VMware", "Fortinet", "Microsoft", "ISO 27001"];

export default function AboutPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const featuredProducts = products.filter(p => p.category !== "Services").slice(0, 5);
  const dealProducts = deals.map(d => ({ deal: d, product: products.find(p => p.id === d.productId)! })).filter(d => d.product);

  return (
    <div className="px-5 py-4 space-y-7 md:max-w-7xl md:mx-auto md:px-8 md:py-8 md:space-y-12">

      {/* ── Hero Carousel ── */}
      <section>
        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
          <div className="flex">
            {heroSlides.map((slide, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 px-1">
                <div className="app-card relative overflow-hidden p-6 md:p-10 min-h-[160px] md:min-h-[240px] flex flex-col justify-end">
                  {/* Yellow accent edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-l-2xl" />
                  <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-primary/8 blur-[40px]" />
                  <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1.5">{slide.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{slide.subtitle}</p>
                  <Link
                    to={slide.link}
                    className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all hover:brightness-110"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h3 className="text-base font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className="app-card flex flex-col items-center gap-2 py-4 px-2 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Featured Products</h3>
          <Link to="/shop" className="text-xs font-medium text-primary flex items-center gap-0.5">
            More <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 scrollbar-hide">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/shop/${product.id}`}
              className="app-card flex-shrink-0 w-40 md:w-48 snap-start overflow-hidden"
            >
              <div className="h-28 bg-secondary/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="gradient-text font-bold text-2xl">{product.name.charAt(0)}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{product.category}</p>
                <h4 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-1">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-foreground">${product.price.toLocaleString()}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[11px] text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Services Card ── */}
      <section>
        <Link to="/services" className="app-card block p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/6 rounded-full blur-[50px]" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/15 text-primary mb-3">
            <Zap className="w-3 h-3" /> 6 Services
          </span>
          <h3 className="text-lg font-bold text-foreground mb-1">IT Consulting & Managed Services</h3>
          <p className="text-sm text-muted-foreground mb-4">Infrastructure assessments, cloud migration, 24/7 support</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Learn More <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </section>

      {/* ── Today's Deals ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Today's Deals</h3>
          <Link to="/shop" className="text-xs font-medium text-primary flex items-center gap-0.5">
            More <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5 scrollbar-hide">
          {dealProducts.map(({ deal, product }) => (
            <Link
              key={deal.id}
              to={`/shop/${product.id}`}
              className="app-card flex-shrink-0 w-44 md:w-52 snap-start overflow-hidden"
            >
              <div className="relative h-28 bg-secondary/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="gradient-text font-bold text-2xl">{product.name.charAt(0)}</span>
                </div>
                {deal.discount > 0 && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {deal.discount}% OFF
                  </span>
                )}
                {!deal.discount && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {deal.badge}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h4 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h4>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-sm font-bold text-foreground">
                    ${deal.discount > 0 ? Math.round(product.price * (1 - deal.discount / 100)).toLocaleString() : product.price.toLocaleString()}
                  </span>
                  {deal.discount > 0 && (
                    <span className="text-[11px] text-muted-foreground line-through">${product.price.toLocaleString()}</span>
                  )}
                </div>
                {deal.endsIn && <p className="text-[10px] text-destructive font-semibold mt-1.5">⏰ {deal.endsIn}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="app-card py-4 px-2 text-center">
              <div className="text-lg md:text-2xl font-extrabold gradient-text">{s.num}</div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="pb-4">
        <h3 className="text-base font-semibold text-foreground mb-3">Trusted Partners</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {partners.map((name) => (
            <span
              key={name}
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-xs font-semibold text-muted-foreground whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
