import { Link } from "react-router-dom";
import { ArrowRight, Server, Shield, Wifi, HardDrive, Monitor, Wrench, ChevronDown, Star, Zap, Clock, Users, CheckCircle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { products, deals } from "@/data/mock";

const categoryCards = [
  { icon: Server, label: "Servers", desc: "Rack & Edge", link: "/shop?cat=Servers" },
  { icon: Shield, label: "Security", desc: "Firewalls & EDR", link: "/shop?cat=Security" },
  { icon: Wifi, label: "Networking", desc: "Switches & SD-WAN", link: "/shop?cat=Networking" },
  { icon: HardDrive, label: "Storage", desc: "NAS & SAN", link: "/shop?cat=Storage" },
  { icon: Monitor, label: "Software", desc: "Licenses & SaaS", link: "/shop?cat=Software" },
  { icon: Wrench, label: "Services", desc: "Consulting & MA", link: "/shop?cat=Services" },
];

const stats = [
  { num: "500+", label: "Enterprise Clients", icon: Users },
  { num: "24/7", label: "Expert Support", icon: Clock },
  { num: "99.9%", label: "Uptime SLA", icon: TrendingUp },
  { num: "50+", label: "Global Partners", icon: CheckCircle },
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
      <section className="hero-section min-h-[85vh] flex items-center relative">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-20 left-[5%] w-[300px] h-[300px] rounded-full bg-cyan/5 blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="max-w-3xl animate-fade-in">
            <div className="badge-pill bg-primary/15 text-primary border border-primary/20 mb-8">
              <Zap className="w-3.5 h-3.5" />
              Enterprise IT Solutions Provider
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Hardware.<br />
              Software.<br />
              <span className="gradient-text">Solutions.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              From servers and networking gear to managed IT services and cloud consulting — we power businesses with best-in-class technology.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="btn-outline">
                Our Services
              </Link>
              <Link to="/contact" className="btn-outline">
                Get a Quote
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-border/50">
              {["Cisco Partner", "AWS Partner", "ISO 27001"].map((badge) => (
                <span key={badge} className="text-xs text-muted-foreground font-medium tracking-wide uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-pill bg-secondary text-muted-foreground mb-4">Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryCards.map((cat) => (
              <Link key={cat.label} to={cat.link} className="tech-card p-5 text-center group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-sm block">{cat.label}</span>
                <span className="text-[11px] text-muted-foreground">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="section-padding border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="badge-pill bg-destructive/15 text-destructive mb-3">Limited Time</span>
              <h2 className="text-3xl md:text-4xl font-bold">Today's Deals</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mb-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealProducts.map(({ deal, product }) => (
              <Link key={deal.id} to={`/shop/${product.id}`} className="tech-card overflow-hidden group">
                <div className="relative aspect-[16/10] bg-secondary/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center" style={{ animation: "float 4s ease-in-out infinite" }}>
                    <span className="gradient-text font-bold text-4xl">{product.name.charAt(0)}</span>
                  </div>
                  <span className="absolute top-3 left-3 badge-pill bg-primary text-primary-foreground text-[10px]">
                    {deal.badge} {deal.discount > 0 && `${deal.discount}% OFF`}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.category}</p>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">${deal.discount > 0 ? Math.round(product.price * (1 - deal.discount / 100)).toLocaleString() : product.price.toLocaleString()}</span>
                      {deal.discount > 0 && <span className="text-sm text-muted-foreground line-through">${product.price.toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  </div>
                  {deal.endsIn && <p className="text-xs text-destructive font-semibold mt-2">⏰ Ends in {deal.endsIn}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Champa Enterprise?</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Trusted by hundreds of businesses across Southeast Asia for mission-critical IT infrastructure.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="tech-card p-6 text-center">
                <s.icon className="w-7 h-7 text-primary mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-extrabold gradient-text stat-glow mb-1">{s.num}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services promo */}
      <section className="section-padding border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="tech-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1">
                <span className="badge-pill bg-accent/15 text-accent mb-4">Professional Services</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Need IT Consulting?</h2>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-xl">
                  From infrastructure assessments and cloud migrations to fully managed IT — our certified engineers handle it all so you can focus on your business.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/services" className="btn-primary text-sm py-3 px-6">
                    View Services <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/contact" className="btn-outline text-sm py-3 px-6">
                    Request a Quote
                  </Link>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-2 shrink-0">
                {["Infrastructure", "Cloud", "Security", "Support"].map((tag) => (
                  <span key={tag} className="badge-pill bg-secondary text-secondary-foreground justify-center">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section-padding border-t border-border/50">
        <div className="max-w-5xl mx-auto text-center">
          <span className="badge-pill bg-secondary text-muted-foreground mb-4">Trusted Partners</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications & Partners</h2>
          <p className="text-muted-foreground mb-10">Industry-leading partnerships and global certifications.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["ISO 27001", "Cisco Partner", "AWS Partner", "VMware", "Fortinet", "Microsoft"].map((name) => (
              <span key={name} className="px-6 py-3 rounded-lg bg-secondary/50 border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-pill bg-secondary text-muted-foreground mb-4">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to upgrade your infrastructure?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Talk to our sales engineers and get a custom solution tailored to your business needs.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-primary">
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/contact" className="btn-outline">
              Chat with Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left tech-card p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </button>
  );
}
