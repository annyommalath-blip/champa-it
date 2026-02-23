import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, HeadphonesIcon, Award, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "What industries do you serve?", a: "We serve a wide range of industries including finance, healthcare, government, telecom, and manufacturing with our enterprise-grade IT solutions." },
  { q: "Do you offer custom solutions?", a: "Yes, our team works closely with clients to design and deploy tailored infrastructure solutions that meet specific business requirements." },
  { q: "What support options are available?", a: "We offer 24/7 technical support, on-site maintenance, remote monitoring, and dedicated account management for enterprise clients." },
  { q: "Where are you located?", a: "Our headquarters and main distribution center are based in Southeast Asia, with regional offices and partners across the globe." },
];

const offerings = [
  { icon: Shield, title: "Enterprise Security", desc: "Next-gen firewalls, intrusion detection, and zero-trust network solutions." },
  { icon: Zap, title: "High-Performance Computing", desc: "Servers and infrastructure built for demanding workloads and scale." },
  { icon: HeadphonesIcon, title: "Managed Services", desc: "24/7 monitoring, maintenance, and support for your entire IT stack." },
  { icon: Award, title: "Certified Solutions", desc: "ISO-certified products with industry-leading warranties and SLAs." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="section-padding min-h-[80vh] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(48_100%_50%/0.06)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 text-primary text-sm font-medium mb-6">
            Enterprise Technology Solutions
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Champa</span> Private Enterprise
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Powering businesses with next-generation IT infrastructure, security solutions, and managed services across Southeast Asia and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all glow-border"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
            >
              Chat with Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who We Are</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Champa Private Enterprise is a leading technology distributor and solutions provider. We partner with global brands to deliver enterprise-grade IT infrastructure — from servers and networking equipment to cybersecurity and power management — ensuring businesses run reliably, securely, and at scale.
          </p>
        </div>
      </section>

      {/* Offerings */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerings.map((item) => (
              <div key={item.title} className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Why Choose Champa?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "500+", label: "Enterprise Clients" },
              { num: "99.9%", label: "Uptime SLA" },
              { num: "24/7", label: "Expert Support" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-8">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.num}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications & Partners</h2>
          <p className="text-muted-foreground mb-8">Trusted by industry leaders and certified across global standards.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {["ISO 27001", "Cisco Partner", "AWS Partner", "VMware", "Fortinet"].map((name) => (
              <div key={name} className="glass-card rounded-lg px-6 py-3 text-sm font-medium text-muted-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-lg">Champa</span>
            </div>
            <p className="text-sm text-muted-foreground">Enterprise technology solutions for the modern business.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact Sales</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-3">
              {["LinkedIn", "Twitter", "GitHub"].map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Champa Private Enterprise. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left glass-card rounded-xl p-5 transition-all">
      <div className="flex items-center justify-between">
        <span className="font-medium">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}
