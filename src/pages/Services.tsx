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

  if (selectedService && submitted) {
    return (
      <div className="px-5 py-14 md:max-w-lg md:mx-auto text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-success" />
        </div>
        <h2 className="text-page-title text-foreground mb-2">Request Submitted</h2>
        <p className="text-body text-muted-foreground mb-7">
          We've received your request for <strong className="text-foreground">{selectedService}</strong>. Our team will contact you within 24 hours.
        </p>
        <div className="bento-card p-5 mb-7 text-left">
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-3">Status Tracker</p>
          {["Submitted", "Under Review", "Quote Sent", "Scheduled"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 py-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-colors ${
                i === 0 ? "bg-foreground text-background" : "bg-secondary text-muted-foreground/40"
              }`}>
                {i === 0 ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[14px] ${i === 0 ? "font-bold text-foreground" : "text-muted-foreground/40"}`}>{step}</span>
              {i === 0 && <span className="ml-auto badge-status bg-success/10 text-success text-[9px]">Complete</span>}
            </div>
          ))}
        </div>
        <button onClick={() => { setSelectedService(null); setSubmitted(false); setWizardStep(0); }} className="btn-secondary w-full">
          Back to Services
        </button>
      </div>
    );
  }

  if (selectedService) {
    const stepLabels = ["Contact", "Needs", "Schedule", "Attach", "Review"];

    return (
      <div className="px-5 py-4 md:max-w-lg md:mx-auto animate-fade-in">
        <button onClick={() => { if (wizardStep === 0) { setSelectedService(null); } else { setWizardStep((wizardStep - 1) as WizardStep); } }}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground mb-5 active:scale-95 transition-transform font-medium">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> {wizardStep === 0 ? "Services" : "Back"}
        </button>

        <h1 className="text-section-title text-foreground mb-1">{selectedService}</h1>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-1.5 mt-4">
          {stepLabels.map((_, i) => (
            <div key={i} className="flex-1">
              <div className={`h-[2.5px] rounded-full transition-all duration-500 ${i <= wizardStep ? "bg-foreground" : "bg-border"}`} />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/40 mb-6 font-bold tracking-wide uppercase">Step {wizardStep + 1}/5 · {stepLabels[wizardStep]}</p>

        {wizardStep === 0 && (
          <div className="space-y-3.5">
            {[
              { key: "name", label: "Full Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "company", label: "Company", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <input type={f.type} value={wizardData[f.key as keyof typeof wizardData] as string} onChange={(e) => setWizardData({...wizardData, [f.key]: e.target.value})} className="input-field" />
              </div>
            ))}
            <button onClick={() => setWizardStep(1)} className="btn-primary w-full mt-2">Continue</button>
          </div>
        )}

        {wizardStep === 1 && (
          <div className="space-y-2">
            <p className="text-[15px] font-bold text-foreground mb-3 tracking-tight">What do you need help with?</p>
            {needOptions.map(n => (
              <button
                key={n}
                onClick={() => toggleNeed(n)}
                className={`w-full p-3.5 rounded-2xl border-[1.5px] text-left flex items-center gap-3 transition-all active:scale-[0.98] ${
                  wizardData.needs.includes(n) ? "border-foreground bg-foreground/[0.02]" : "border-border bg-card"
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-md border-[1.5px] flex items-center justify-center transition-colors ${
                  wizardData.needs.includes(n) ? "bg-foreground border-foreground" : "border-border"
                }`} style={{ width: 18, height: 18 }}>
                  {wizardData.needs.includes(n) && <Check className="w-3 h-3 text-background" />}
                </div>
                <span className="text-[14px] font-medium text-foreground">{n}</span>
              </button>
            ))}
            <button onClick={() => setWizardStep(2)} className="btn-primary w-full mt-3">Continue</button>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-[15px] font-bold text-foreground mb-3 tracking-tight">How urgent is this?</p>
              {["Today", "This week", "Flexible"].map(u => (
                <button
                  key={u}
                  onClick={() => setWizardData({...wizardData, urgency: u})}
                  className={`w-full p-3.5 rounded-2xl border-[1.5px] text-left mb-2 transition-all active:scale-[0.98] ${
                    wizardData.urgency === u ? "border-foreground bg-foreground/[0.02]" : "border-border bg-card"
                  }`}
                >
                  <span className="text-[14px] font-medium text-foreground">{u}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">Preferred Schedule</label>
              <input type="text" placeholder="e.g., Weekday mornings" value={wizardData.schedule} onChange={(e) => setWizardData({...wizardData, schedule: e.target.value})} className="input-field" />
            </div>
            <button onClick={() => setWizardStep(3)} className="btn-primary w-full">Continue</button>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="space-y-4">
            <p className="text-[15px] font-bold text-foreground tracking-tight">Attach files (optional)</p>
            <p className="text-caption text-muted-foreground/60 -mt-2">Network diagrams, photos, or relevant docs.</p>
            <label className="flex flex-col items-center gap-2.5 p-8 rounded-2xl border-[1.5px] border-dashed border-border hover:border-foreground/20 cursor-pointer transition-colors active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                <Upload className="w-4 h-4 text-muted-foreground/30" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">Tap to upload</span>
              <span className="text-[10px] text-muted-foreground/40">PNG, JPG, PDF up to 10MB</span>
              <input type="file" multiple className="hidden" onChange={(e) => {
                if (e.target.files) setWizardData({...wizardData, files: [...wizardData.files, ...Array.from(e.target.files)]});
              }} />
            </label>
            {wizardData.files.length > 0 && (
              <div className="space-y-1.5">
                {wizardData.files.map((f, i) => (
                  <div key={i} className="text-[12px] text-muted-foreground flex items-center gap-2 p-2.5 bg-card rounded-xl" style={{ boxShadow: "var(--shadow-xs)" }}>
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
            <p className="text-[15px] font-bold text-foreground tracking-tight">Review your request</p>
            <div className="bento-card divide-y divide-border/30 overflow-hidden">
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
                  <span className="text-[12px] text-muted-foreground/50 font-medium">{r.label}</span>
                  <span className="text-[12px] font-semibold text-foreground text-right max-w-[60%] truncate">{r.value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSubmitWizard} className="btn-primary w-full">Submit Request</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="md:max-w-7xl md:mx-auto">
      <div className="px-5 pt-4 pb-5 md:px-8">
        <h1 className="text-page-title text-foreground mb-1">{t("services.title")}</h1>
        <p className="text-body text-muted-foreground/70 max-w-xl mb-5">{t("services.subtitle")}</p>
        <div className="flex gap-2.5">
          <a href="#quote" className="btn-primary py-2.5 px-5 text-[13px]">
            {t("services.requestQuote")} <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <Link to="/contact" className="btn-outline py-2.5 px-5 text-[13px]">
            Book Consultation
          </Link>
        </div>
      </div>

      <div className="px-5 md:px-8 pb-8">
        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] mb-3">Our Services</p>
        <div className="space-y-2">
          {services.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => { setSelectedService(s.title); setWizardStep(0); setSubmitted(false); setWizardData({ name: "", email: "", phone: "", company: "", needs: [], urgency: "", schedule: "", files: [] }); }}
              className="bento-card w-full p-4 text-left flex items-start gap-3.5 active:scale-[0.98] transition-transform animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <s.icon className="w-[18px] h-[18px] text-muted-foreground/40 shrink-0 mt-0.5" strokeWidth={1.8} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="text-[14px] font-bold text-foreground tracking-tight">{s.title}</h3>
                  {s.tags.map(tag => (
                    <span key={tag} className="badge-status bg-primary/10 text-primary text-[9px]">{tag}</span>
                  ))}
                </div>
                <p className="text-[12px] text-muted-foreground/50">{s.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[13px] font-extrabold text-foreground tracking-tight">{s.price}</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40 font-medium">
                    <Clock className="w-2.5 h-2.5" strokeWidth={2} /> {s.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/15 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      <section id="quote" className="px-5 md:px-8 pb-10">
        <div className="bento-card p-5 md:p-7">
          <h2 className="text-section-title text-foreground mb-1">{t("services.quoteTitle")}</h2>
          <p className="text-caption text-muted-foreground/60 mb-5">{t("services.quoteSubtitle")}</p>
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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {[
          { key: "name", label: t("services.name"), type: "text", required: true },
          { key: "email", label: t("services.email"), type: "email", required: true },
          { key: "phone", label: t("services.phone"), type: "tel" },
          { key: "company", label: t("services.company"), type: "text" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{f.label} {f.required && "*"}</label>
            <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-field" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("services.serviceType")} *</label>
        <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="input-field">
          <option value="">{t("services.selectService")}</option>
          {services.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("services.budget")}</label>
          <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="input-field">
            <option value="">{t("services.select")}</option>
            <option value="<5k">Under $5,000</option>
            <option value="5k-25k">$5,000 – $25,000</option>
            <option value="25k-100k">$25,000 – $100,000</option>
            <option value=">100k">$100,000+</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("services.timeline")}</label>
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
        <label className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("services.projectDetails")} *</label>
        <textarea rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="input-field resize-none" placeholder={t("services.detailsPlaceholder")} />
      </div>
      <button type="submit" className="btn-primary w-full">{t("services.submitQuote")}</button>
    </form>
  );
}
