import { Link } from "react-router-dom";
import { ArrowRight, Server, Cloud, Shield, HeadphonesIcon, BarChart3, Wrench, Clock, Zap, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const services = [
  { icon: BarChart3, titleKey: "IT Infrastructure Assessment", descKey: "Comprehensive audit of your servers, network, security, and cloud readiness.", price: "From $2,500", time: "1-2 weeks", tags: ["Popular"] },
  { icon: Cloud, titleKey: "Cloud Migration & Consulting", descKey: "Expert-led migration planning and execution for AWS, Azure, or GCP.", price: "From $5,000", time: "2-8 weeks", tags: ["Recommended"] },
  { icon: HeadphonesIcon, titleKey: "Managed IT Support", descKey: "24/7 proactive monitoring, maintenance, patching, and helpdesk.", price: "$1,500/mo", time: "Ongoing", tags: [] },
  { icon: Shield, titleKey: "Cybersecurity Services", descKey: "Penetration testing, vulnerability assessments, and incident response.", price: "Custom", time: "1-4 weeks", tags: [] },
  { icon: Server, titleKey: "Data Center Design", descKey: "End-to-end data center planning, build-out, and optimization.", price: "Custom", time: "4-12 weeks", tags: [] },
  { icon: Wrench, titleKey: "Hardware Maintenance", descKey: "Extended warranties, break-fix support, and spare parts management.", price: "From $200/mo", time: "Ongoing", tags: ["Popular"] },
];

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <div className="md:max-w-7xl md:mx-auto">
      {/* Compact header — no yellow hero */}
      <div className="px-5 pt-5 pb-4 md:px-8 md:pt-8 md:pb-6">
        <span className="chip chip-active text-micro mb-3 inline-flex">
          <Zap className="w-3 h-3" /> {t("services.badge")}
        </span>
        <h1 className="text-page-title text-foreground mb-1.5">{t("services.title")}</h1>
        <p className="text-body text-muted-foreground max-w-xl mb-5">
          {t("services.subtitle")}
        </p>
        <div className="flex gap-3">
          <a href="#quote" className="btn-primary py-2.5 px-5 text-caption">
            {t("services.requestQuote")} <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <Link to="/contact" className="btn-outline py-2.5 px-5 text-caption">
            {t("services.chatWithSales")}
          </Link>
        </div>
      </div>

      {/* Service catalog */}
      <div className="px-5 md:px-8 pb-8">
        <h2 className="text-section-title text-foreground mb-4">{t("services.whatWeOffer")}</h2>
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.titleKey} className="app-card p-4 md:p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-body font-semibold text-foreground">{s.titleKey}</h3>
                  {s.tags.map(tag => (
                    <span key={tag} className="badge-status bg-primary/10 text-primary">{tag}</span>
                  ))}
                </div>
                <p className="text-caption text-muted-foreground leading-relaxed">{s.descKey}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-caption font-bold text-foreground">{s.price}</span>
                  <span className="flex items-center gap-1 text-micro text-muted-foreground">
                    <Clock className="w-3 h-3" /> {s.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Quote form */}
      <section id="quote" className="px-5 md:px-8 pb-10">
        <div className="app-card p-5 md:p-8">
          <h2 className="text-section-title text-foreground mb-1">{t("services.quoteTitle")}</h2>
          <p className="text-caption text-muted-foreground mb-5">{t("services.quoteSubtitle")}</p>
          <QuoteForm />
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "name", label: t("services.name"), type: "text", required: true },
          { key: "email", label: t("services.email"), type: "email", required: true },
          { key: "phone", label: t("services.phone"), type: "tel" },
          { key: "company", label: t("services.company"), type: "text" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-caption text-muted-foreground mb-1.5 block">{f.label} {f.required && "*"}</label>
            <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-field" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-caption text-muted-foreground mb-1.5 block">{t("services.serviceType")} *</label>
        <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="input-field">
          <option value="">{t("services.selectService")}</option>
          {services.map(s => <option key={s.titleKey} value={s.titleKey}>{s.titleKey}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-caption text-muted-foreground mb-1.5 block">{t("services.budget")}</label>
          <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="input-field">
            <option value="">{t("services.select")}</option>
            <option value="<5k">Under $5,000</option>
            <option value="5k-25k">$5,000 – $25,000</option>
            <option value="25k-100k">$25,000 – $100,000</option>
            <option value=">100k">$100,000+</option>
          </select>
        </div>
        <div>
          <label className="text-caption text-muted-foreground mb-1.5 block">{t("services.timeline")}</label>
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
        <label className="text-caption text-muted-foreground mb-1.5 block">{t("services.projectDetails")} *</label>
        <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={4} placeholder={t("services.projectPlaceholder")} className="input-field resize-none" />
      </div>
      <button type="submit" className="btn-primary w-full">{t("services.submitQuote")}</button>
    </form>
  );
}
