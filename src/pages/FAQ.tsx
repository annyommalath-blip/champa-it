import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

const faqs = [
  { q: "How do I place an order?", a: "Browse the Shop, add products to your cart, and proceed to checkout. You can check out as a guest or sign in for faster reorders." },
  { q: "What payment methods do you accept?", a: "We currently accept bank transfer. Upload your payment screenshot at checkout and we'll verify within 24 hours." },
  { q: "How do I track my order?", a: "Signed-in users can view all orders under Profile → My Orders. Guests receive tracking details via email and SMS." },
  { q: "How do I request a quote for IT services?", a: "Go to Services, pick a category, and follow the 5-step wizard. Our team responds within 1 business day." },
  { q: "Can I return or exchange items?", a: "Yes, within 7 days of delivery for unopened items. Contact support via chat to start a return." },
  { q: "Do you deliver outside Vientiane?", a: "Yes — nationwide delivery is available. Delivery fees vary by location and are shown at checkout." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="px-5 py-5 space-y-5 md:max-w-2xl md:mx-auto md:px-8 md:py-8 animate-fade-in">
      <Link to="/profile" className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-page-title text-foreground">FAQ</h1>

      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="bento-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
              <span className="text-[14px] font-semibold text-foreground pr-3">{f.q}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-4 pb-4 text-[13px] text-muted-foreground leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>

      <div className="bento-card p-5 text-center space-y-2">
        <p className="text-[13px] text-muted-foreground">Still need help?</p>
        <Link to="/chat"><button className="btn-primary">Contact support</button></Link>
      </div>
    </div>
  );
}
