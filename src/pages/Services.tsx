import { Link } from "react-router-dom";
import { ArrowRight, Server, Cloud, Shield, HeadphonesIcon, BarChart3, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

const services = [
  {
    icon: BarChart3,
    title: "IT Infrastructure Assessment",
    desc: "Comprehensive audit of your servers, network, security, and cloud readiness with actionable recommendations.",
    price: "From $2,500",
  },
  {
    icon: Cloud,
    title: "Cloud Migration & Consulting",
    desc: "Expert-led migration planning and execution for AWS, Azure, or GCP with minimal downtime.",
    price: "From $5,000",
  },
  {
    icon: HeadphonesIcon,
    title: "Managed IT Support",
    desc: "24/7 proactive monitoring, maintenance, patching, and helpdesk for your entire IT stack.",
    price: "$1,500/mo",
  },
  {
    icon: Shield,
    title: "Cybersecurity Services",
    desc: "Penetration testing, vulnerability assessments, incident response planning, and security training.",
    price: "Custom",
  },
  {
    icon: Server,
    title: "Data Center Design",
    desc: "End-to-end data center planning, build-out, and optimization for on-prem and hybrid environments.",
    price: "Custom",
  },
  {
    icon: Wrench,
    title: "Hardware Maintenance & Warranty",
    desc: "Extended warranties, break-fix support, and spare parts management for all enterprise hardware.",
    price: "From $200/mo",
  },
];

export default function ServicesPage() {
  const { addNotification } = useApp();

  return (
    <div>
      {/* Hero */}
      <section className="hero-dark">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 md:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">IT Services & Consulting</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            From infrastructure audits to fully managed IT — we help businesses run reliably, securely, and at scale.
          </p>
          <a href="#quote" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
            Request a Free Quote <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Service Cards */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="glass-card p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.desc}</p>
                <span className="text-sm font-semibold text-accent">{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="section-padding bg-muted/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Request a Quote</h2>
          <p className="text-muted-foreground text-center mb-8">Tell us about your project and we'll get back to you within 24 hours.</p>
          <QuoteForm onSubmit={(data) => {
            addNotification({ type: "contact_form", title: "New Quote Request", message: `${data.name} requested a quote for ${data.serviceType}.`, referenceId: "quote-" + Date.now() });
            toast.success("Quote request submitted! Our team will contact you within 24 hours.");
          }} />
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Not Sure What You Need?</h2>
          <p className="text-muted-foreground mb-6">Our sales engineers can help you find the right combination of hardware, software, and services for your business.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
            Chat with Sales <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuoteForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", serviceType: "", budget: "", timeline: "", details: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.serviceType || !form.details) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSubmit(form);
    setForm({ name: "", email: "", phone: "", company: "", serviceType: "", budget: "", timeline: "", details: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { key: "name", label: "Name", type: "text", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "phone", label: "Phone", type: "tel" },
          { key: "company", label: "Company", type: "text" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm text-muted-foreground mb-1.5 block">{f.label} {f.required && "*"}</label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Service Type *</label>
        <select
          value={form.serviceType}
          onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Select a service...</option>
          {services.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Budget Range</label>
          <select
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select...</option>
            <option value="<5k">Under $5,000</option>
            <option value="5k-25k">$5,000 – $25,000</option>
            <option value="25k-100k">$25,000 – $100,000</option>
            <option value=">100k">$100,000+</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Timeline</label>
          <select
            value={form.timeline}
            onChange={(e) => setForm({ ...form, timeline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select...</option>
            <option value="asap">ASAP</option>
            <option value="1-3months">1–3 months</option>
            <option value="3-6months">3–6 months</option>
            <option value="6months+">6+ months</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Project Details *</label>
        <textarea
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
          rows={4}
          placeholder="Describe your project requirements, current infrastructure, and goals..."
          className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>
      <button type="submit" className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
        Submit Quote Request
      </button>
    </form>
  );
}
