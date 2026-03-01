import { Link } from "react-router-dom";
import { ArrowRight, Server, Cloud, Shield, HeadphonesIcon, BarChart3, Wrench, Clock, ChevronRight, Check, Upload, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const services = [
  { icon: BarChart3, title: "IT Infrastructure Assessment", desc: "Comprehensive audit with actionable recommendations.", price: "From $2,500", time: "1–2 weeks", tags: ["Popular"] },
  { icon: Cloud, title: "Cloud Migration & Consulting", desc: "Expert-led migration for AWS, Azure, or GCP.", price: "From $5,000", time: "2–8 weeks", tags: ["Recommended"] },
  { icon: HeadphonesIcon, title: "Managed IT Support", desc: "24/7 proactive monitoring and helpdesk.", price: "$1,500/mo", time: "Ongoing", tags: [] },
  { icon: Shield, title: "Cybersecurity Services", desc: "Penetration testing and incident response.", price: "Custom", time: "1–4 weeks", tags: [] },
  { icon: Server, title: "Data Center Design", desc: "End-to-end planning, build-out, and optimization.", price: "Custom", time: "4–12 weeks", tags: [] },
  { icon: Wrench, title: "Hardware Maintenance", desc: "Break-fix support and spare parts management.", price: "From $200/mo", time: "Ongoing", tags: ["Popular"] },
];

type WizardStep = 0 | 1 | 2 | 3 | 4;

export default function ServicesPage() {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(0);
  const [wizardData, setWizardData] = useState({
    name: "", email: "", phone: "", company: "",
    needs: [] as string[],
    urgency: "" as string,
    schedule: "" as string,
    files: [] as File[],
  });
  const [submitted, setSubmitted] = useState(false);

  const needOptions = ["Server Setup", "Network Config", "Security Audit", "Cloud Migration", "Data Backup", "Software Licensing", "Hardware Repair", "Other"];

  const toggleNeed = (n: string) => {
    setWizardData(prev => ({
      ...prev,
      needs: prev.needs.includes(n) ? prev.needs.filter(x => x !== n) : [...prev.needs, n],
    }));
  };

  const handleSubmitWizard = () => {
    toast.success("Service request submitted! We'll contact you within 24 hours.");
    setSubmitted(true);
  };

  // Submitted success view
  if (selectedService && submitted) {
    return (
      <div className="px-5 py-16 md:max-w-lg md:mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-page-title text-foreground mb-2">Request Submitted</h2>
        <p className="text-body text-muted-foreground mb-6">
          We've received your request for <strong>{selectedService}</strong>. Our team will contact you within 24 hours.
        </p>
        <div className="app-card p-5 mb-6 text-left">
          <h3 className="text-micro font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status Tracker</h3>
          {["Submitted", "Under Review", "Quote Sent", "Scheduled"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 py-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-micro font-bold ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i === 0 ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-body ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{step}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSelectedService(null); setSubmitted(false); setWizardStep(0); }} className="btn-secondary w-full">
          Back to Services
        </button>
      </div>
    );
  }

  // Wizard view
  if (selectedService) {
    const stepLabels = ["Contact", "Needs", "Schedule", "Attach", "Review"];

    return (
      <div className="px-5 py-4 md:max-w-lg md:mx-auto animate-fade-in">
        <button onClick={() => { if (wizardStep === 0) { setSelectedService(null); } else { setWizardStep((wizardStep - 1) as WizardStep); } }}
          className="flex items-center gap-1.5 text-caption text-muted-foreground mb-5 active:scale-95 transition-transform">
          <ArrowLeft className="w-4 h-4" /> {wizardStep === 0 ? "Services" : "Back"}
        </button>

        <h1 className="text-section-title text-foreground mb-1">{selectedService}</h1>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-2 mt-4">
          {stepLabels.map((_, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${i <= wizardStep ? "bg-primary" : "bg-border"}`} />
            </div>
          ))}
        </div>
        <p className="text-micro text-muted-foreground mb-6">Step {wizardStep + 1} of 5 — {stepLabels[wizardStep]}</p>

        {wizardStep === 0 && (
          <div className="space-y-3">
            {[
              { key: "name", label: "Full Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "company", label: "Company", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-caption text-muted-foreground mb-1.5 block">{f.label}</label>
                <input type={f.type} value={wizardData[f.key as keyof typeof wizardData] as string} onChange={(e) => setWizardData({...wizardData, [f.key]: e.target.value})} className="input-field" />
              </div>
            ))}
            <button onClick={() => setWizardStep(1)} className="btn-primary w-full mt-4">Continue</button>
          </div>
        )}

        {wizardStep === 1 && (
          <div className="space-y-2">
            <p className="text-body text-foreground font-semibold mb-3">What do you need help with?</p>
            {needOptions.map(n => (
              <button
                key={n}
                onClick={() => toggleNeed(n)}
                className={`w-full p-3.5 rounded-[14px] border text-left flex items-center gap-3 transition-all active:scale-[0.98] ${
                  wizardData.needs.includes(n) ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  wizardData.needs.includes(n) ? "bg-primary border-primary" : "border-border"
                }`}>
                  {wizardData.needs.includes(n) && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-body text-foreground">{n}</span>
              </button>
            ))}
            <button onClick={() => setWizardStep(2)} className="btn-primary w-full mt-4">Continue</button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-body font-semibold text-foreground mb-3">How urgent is this?</p>
              {["Today", "This week", "Flexible"].map(u => (
                <button
                  key={u}
                  onClick={() => setWizardData({...wizardData, urgency: u})}
                  className={`w-full p-3.5 rounded-[14px] border text-left mb-2 transition-all active:scale-[0.98] ${
                    wizardData.urgency === u ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <span className="text-body text-foreground">{u}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="text-caption text-muted-foreground mb-1.5 block">Preferred schedule</label>
              <input type="text" placeholder="e.g., Weekday mornings" value={wizardData.schedule} onChange={(e) => setWizardData({...wizardData, schedule: e.target.value})} className="input-field" />
            </div>
            <button onClick={() => setWizardStep(3)} className="btn-primary w-full">Continue</button>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-4">
            <p className="text-body font-semibold text-foreground mb-1">Attach files or photos (optional)</p>
            <p className="text-caption text-muted-foreground">Network diagrams, photos, or any relevant documents.</p>
            <label className="flex flex-col items-center gap-2 p-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors active:scale-[0.98]">
              <Upload className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-caption font-medium text-foreground">Tap to upload</span>
              <span className="text-micro text-muted-foreground">PNG, JPG, PDF up to 10MB</span>
              <input type="file" multiple className="hidden" onChange={(e) => {
                if (e.target.files) setWizardData({...wizardData, files: [...wizardData.files, ...Array.from(e.target.files)]});
              }} />
            </label>
            {wizardData.files.length > 0 && (
              <div className="space-y-1.5">
                {wizardData.files.map((f, i) => (
                  <div key={i} className="text-caption text-muted-foreground flex items-center gap-2">
                    <Check className="w-3 h-3 text-success" /> {f.name}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setWizardStep(4)} className="btn-primary w-full">Continue</button>
          </div>
        )}

        {wizardStep === 4 && (
          <div className="space-y-4">
            <p className="text-body font-semibold text-foreground mb-2">Review your request</p>
            <div className="app-card divide-y divide-border/60 overflow-hidden">
              {[
                { label: "Service", value: selectedService },
                { label: "Name", value: wizardData.name },
                { label: "Email", value: wizardData.email },
                { label: "Company", value: wizardData.company },
                { label: "Needs", value: wizardData.needs.join(", ") || "—" },
                { label: "Urgency", value: wizardData.urgency || "—" },
                { label: "Files", value: wizardData.files.length > 0 ? `${wizardData.files.length} file(s)` : "None" },
              ].map(r => (
                <div key={r.label} className="flex justify-between px-4 py-3">
                  <span className="text-caption text-muted-foreground">{r.label}</span>
                  <span className="text-caption font-medium text-foreground text-right max-w-[60%] truncate">{r.value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSubmitWizard} className="btn-primary w-full">Submit Request</button>
          </div>
        )}
      </div>
    );
  }

  // Service catalog
  return (
    <div className="md:max-w-7xl md:mx-auto">
      <div className="px-5 pt-6 pb-5 md:px-8">
        <h1 className="text-page-title text-foreground mb-1">{t("services.title")}</h1>
        <p className="text-body text-muted-foreground max-w-xl mb-5">{t("services.subtitle")}</p>
        <div className="flex gap-2.5">
          <a href="#quote" className="btn-primary py-2.5 px-5 text-caption">
            {t("services.requestQuote")} <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <Link to="/contact" className="btn-outline py-2.5 px-5 text-caption">
            Book Consultation
          </Link>
        </div>
      </div>

      <div className="px-5 md:px-8 pb-10">
        <h2 className="text-section-title text-foreground mb-4">{t("services.whatWeOffer")}</h2>
        <div className="space-y-2.5">
          {services.map((s) => (
            <button
              key={s.title}
              onClick={() => { setSelectedService(s.title); setWizardStep(0); setSubmitted(false); setWizardData({ name: "", email: "", phone: "", company: "", needs: [], urgency: "", schedule: "", files: [] }); }}
              className="app-card-interactive w-full p-4 text-left flex items-center gap-4"
            >
              <s.icon className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="text-body font-semibold text-foreground">{s.title}</h3>
                  {s.tags.map(tag => (
                    <span key={tag} className="badge-status bg-primary/10 text-primary">{tag}</span>
                  ))}
                </div>
                <p className="text-caption text-muted-foreground">{s.desc}</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-caption font-bold text-foreground">{s.price}</span>
                  <span className="flex items-center gap-1 text-micro text-muted-foreground">
                    <Clock className="w-3 h-3" strokeWidth={1.8} /> {s.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </button>
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
          {services.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
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
