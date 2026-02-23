import { Link } from "react-router-dom";
import { ArrowRight, Server, Shield, Wifi, HardDrive, Monitor, Wrench, ChevronDown, Star, Zap, Clock, Users } from "lucide-react";
import { useState } from "react";
import { products, deals } from "@/data/mock";
import logo from "@/assets/logo.jpg";

const categoryCards = [
  { icon: Server, label: "Servers", color: "bg-blue-50 text-blue-600", link: "/shop?cat=Servers" },
  { icon: Shield, label: "Security", color: "bg-red-50 text-red-600", link: "/shop?cat=Security" },
  { icon: Wifi, label: "Networking", color: "bg-green-50 text-green-600", link: "/shop?cat=Networking" },
  { icon: HardDrive, label: "Storage", color: "bg-purple-50 text-purple-600", link: "/shop?cat=Storage" },
  { icon: Monitor, label: "Software", color: "bg-orange-50 text-orange-600", link: "/shop?cat=Software" },
  { icon: Wrench, label: "Services", color: "bg-teal-50 text-teal-600", link: "/shop?cat=Services" },
];

const stats = [
  { icon: Users, num: "500+", label: "Enterprise Clients" },
  { icon: Clock, num: "24/7", label: "Expert Support" },
  { icon: Star, num: "99.9%", label: "Uptime SLA" },
  { icon: Zap, num: "50+", label: "Global Partners" },
];

const faqs = [
  { q: "What industries do you serve?", a: "We serve finance, healthcare, government, telecom, manufacturing, and more with our enterprise-grade IT solutions." },
  { q: "Do you offer custom solutions?", a: "Yes, our team works closely with clients to design and deploy tailored infrastructure solutions that meet specific business requirements." },
  { q: "What support options are available?", a: "We offer 24/7 technical support, on-site maintenance, remote monitoring, and dedicated account management for enterprise clients." },
  { q: "Do you sell software licenses?", a: "Absolutely. We sell endpoint security suites, monitoring platforms, backup solutions, and more — both subscription and perpetual licenses." },
];

export default function AboutPage() {
  const dealProducts = deals.map(d => ({ deal: d, product: products.find(p => p.id === d.productId)! })).filter(d => d.product);

  return (
    <div>
      {/* Hero */}
      <section className="hero-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(45_96%_48%/0.15)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24 md:px-8 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 animate-fade-in">
            <div className="badge-pill bg-primary/20 text-primary mb-6">
              <Zap className="w-3.5 h-3.5" /> #1 Enterprise IT Solutions Provider
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
              Hardware. Software.{" "}
              <span className="gradient-text">Solutions.</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl leading-relaxed">
              From servers and networking gear to managed IT services and cloud consulting — we power businesses across Southeast Asia with best-in-class technology.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all glow-border"
              >
                Shop Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Our Services
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Get a Quote
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <img src={logo} alt="Champa Enterprise" className="w-48 h-48 rounded-2xl object-cover shadow-2xl border-4 border-white/10" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryCards.map((cat) => (
              <Link key={cat.label} to={cat.link} className="category-card">
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">🔥 Today's Deals</h2>
            <Link to="/shop" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealProducts.map(({ deal, product }) => (
              <Link key={deal.id} to={`/shop/${product.id}`} className="glass-card overflow-hidden group">
                <div className="relative aspect-[16/10] bg-muted flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="gradient-text font-bold text-4xl">{product.name.charAt(0)}</span>
                  </div>
                  <span className="absolute top-3 left-3 badge-pill bg-primary text-primary-foreground">
                    {deal.badge} {deal.discount > 0 && `${deal.discount}% OFF`}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                  <h3 className="font-semibold group-hover:text-accent transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">${deal.discount > 0 ? Math.round(product.price * (1 - deal.discount / 100)).toLocaleString() : product.price.toLocaleString()}</span>
                      {deal.discount > 0 && <span className="text-sm text-muted-foreground line-through">${product.price.toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      {product.rating}
                    </div>
                  </div>
                  {deal.endsIn && <p className="text-xs text-destructive font-medium mt-2">⏰ Ends in {deal.endsIn}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding hero-dark">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white">Why Champa Enterprise?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{s.num}</div>
                <div className="text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services promo */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Need IT Consulting?</h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                From infrastructure assessments and cloud migrations to fully managed IT — our certified engineers handle it all. Focus on your business while we handle the tech.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
                  View Services <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-semibold hover:bg-muted transition-colors">
                  Request a Quote
                </Link>
              </div>
            </div>
            <div className="hidden md:flex gap-3">
              {["Infrastructure", "Cloud", "Security", "Support"].map((tag) => (
                <span key={tag} className="badge-pill bg-muted text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section-padding bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Certifications & Partners</h2>
          <p className="text-muted-foreground mb-8">Trusted by industry leaders and certified across global standards.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["ISO 27001", "Cisco Partner", "AWS Partner", "VMware", "Fortinet", "Microsoft Partner"].map((name) => (
              <span key={name} className="px-5 py-2.5 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left glass-card p-5 transition-all">
      <div className="flex items-center justify-between">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}
