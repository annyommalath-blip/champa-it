import { Link } from "react-router-dom";
import { ArrowRight, Server, Cloud, Shield, HeadphonesIcon, BarChart3, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const services = [
  { icon: BarChart3, titleKey: "IT Infrastructure Assessment", descKey: "Comprehensive audit of your servers, network, security, and cloud readiness with actionable recommendations.", price: "From $2,500" },
  { icon: Cloud, titleKey: "Cloud Migration & Consulting", descKey: "Expert-led migration planning and execution for AWS, Azure, or GCP with minimal downtime.", price: "From $5,000" },
  { icon: HeadphonesIcon, titleKey: "Managed IT Support", descKey: "24/7 proactive monitoring, maintenance, patching, and helpdesk for your entire IT stack.", price: "$1,500/mo" },
  { icon: Shield, titleKey: "Cybersecurity Services", descKey: "Penetration testing, vulnerability assessments, incident response planning, and security training.", price: "Custom" },
  { icon: Server, titleKey: "Data Center Design", descKey: "End-to-end data center planning, build-out, and optimization for on-prem and hybrid environments.", price: "Custom" },
  { icon: Wrench, titleKey: "Hardware Maintenance", descKey: "Extended warranties, break-fix support, and spare parts management for all enterprise hardware.", price: "From $200/mo" },
];

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="hero-section border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 md:px-8 text-center relative z-10">
          <span className="badge-pill bg-primary/15 text-primary border border-primary/20 mb-6">{t("services.badge")}</span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("services.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("services.subtitle")}
          </p>
          <a href="#quote" className="btn-primary">
            {t("services.requestQuote")} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{t("services.whatWeOffer")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.titleKey} className="tech-card p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{s.titleKey}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.descKey}</p>
                <span className="text-sm font-bold gradient-text">{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className="section-padding border-t border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{t("services.quoteTitle")}</h2>
            <p className="text-muted-foreground">{t("services.quoteSubtitle")}</p>
          </div>
          <QuoteForm />
        </div>
      </section>

      <section className="section-padding border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("services.notSure")}</h2>
          <p className="text-muted-foreground mb-6">{t("services.notSureDesc")}</p>
          <Link to="/contact" className="btn-primary">{t("services.chatWithSales")} <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
    </div>
  );
}

function QuoteForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", serviceType: "", budget: "", timeline: "", details: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.serviceType || !form.details) {
      toast.error(t("services.fillRequired"));
      return;
    }
    toast.success(t("services.quoteSuccess"));
    setForm({ name: "", email: "", phone: "", company: "", serviceType: "", budget: "", timeline: "", details: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="tech-card p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { key: "name", label: t("services.name"), type: "text", required: true },
          { key: "email", label: t("services.email"), type: "email", required: true },
          { key: "phone", label: t("services.phone"), type: "tel" },
          { key: "company", label: t("services.company"), type: "text" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm text-muted-foreground mb-1.5 block">{f.label} {f.required && "*"}</label>
            <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-field" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">{t("services.serviceType")} *</label>
        <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="input-field">
          <option value="">{t("services.selectService")}</option>
          {services.map(s => <option key={s.titleKey} value={s.titleKey}>{s.titleKey}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">{t("services.budget")}</label>
          <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="input-field">
            <option value="">{t("services.select")}</option>
            <option value="<5k">Under $5,000</option>
            <option value="5k-25k">$5,000 – $25,000</option>
            <option value="25k-100k">$25,000 – $100,000</option>
            <option value=">100k">$100,000+</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">{t("services.timeline")}</label>
          <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="input-field">
            <option value="">{t("services.select")}</option>
            <option value="asap">ASAP</option>
            <option value="1-3months">1–3 months</option>
            <option value="3-6months">3–6 months</option>
            <option value="6months+">6+ months</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">{t("services.projectDetails")} *</label>
        <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={4} placeholder={t("services.projectPlaceholder")} className="input-field resize-none" />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">{t("services.submitQuote")}</button>
    </form>
  );
}
