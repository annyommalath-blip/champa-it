import { useState } from "react";
import { Send, Clock, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      <section className="hero-section border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-18 md:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Sales</h1>
          <p className="text-muted-foreground text-lg">Get in touch with our team. We typically respond within 1 hour.</p>
        </div>
      </section>

      <div className="section-padding">
        <div className="max-w-2xl mx-auto">
          <ContactForm onSubmit={() => {
            toast.success("Your message has been sent! Our team will reach out soon.");
          }} />
        </div>
      </div>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-40"
          style={{ animation: "pulse-glow 2s infinite" }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

function ContactForm({ onSubmit }: { onSubmit: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "", preferredContactTime: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in required fields"); return; }
    onSubmit();
    setForm({ name: "", email: "", phone: "", company: "", message: "", preferredContactTime: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="tech-card p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { key: "name", label: "Name", type: "text", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "phone", label: "Phone", type: "tel" },
          { key: "company", label: "Company", type: "text" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm text-muted-foreground mb-1.5 block">{f.label} {f.required && "*"}</label>
            <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-field" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Preferred Contact Time</label>
        <input type="text" placeholder="e.g., 9 AM - 12 PM EST" value={form.preferredContactTime} onChange={(e) => setForm({ ...form, preferredContactTime: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Message *</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="input-field resize-none" />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">Send Message</button>
    </form>
  );
}
