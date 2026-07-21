import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, MapPin, Truck, Upload, CheckCircle, Loader2, CreditCard, Building2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

const DELIVERY_FEE = 20000;
type Step = "cart" | "info" | "delivery" | "payment";
type PayMethod = "card" | "bank_transfer";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useApp();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("cart");
  const [checkoutMode, setCheckoutMode] = useState<"signin" | "guest" | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guestFolder] = useState(() => crypto.randomUUID());
  const [cardOrderId, setCardOrderId] = useState<string | null>(null);

  // Auto-fill contact info from the signed-in user's profile (user can still edit)
  useEffect(() => {
    if (!user || !profile) return;
    setForm((prev) => ({
      name: prev.name || profile.full_name || "",
      phone: prev.phone || profile.phone || "",
      email: prev.email || profile.email || user.email || "",
      address: prev.address || profile.address || "",
      notes: prev.notes,
    }));
  }, [user, profile]);

  const deliveryFee = deliveryMethod === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = cartTotal + deliveryFee;

  if (cart.length === 0 && step === "cart") {
    return (
      <div className="px-5 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="text-section-title text-foreground mb-1">{t("cart.empty")}</h2>
        <p className="text-caption text-muted-foreground mb-6">{t("cart.emptyDesc")}</p>
        <Link to="/shop" className="btn-primary">{t("cart.browseShop")}</Link>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: "cart", label: t("cart.title") },
    { key: "info", label: t("cart.step.info") },
    { key: "delivery", label: t("cart.step.delivery") },
    { key: "payment", label: t("cart.step.payment") },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const folder = user ? user.id : `guest/${guestFolder}`;
    const path = `${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("payment-screenshots").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    setScreenshotUrl(path);
    setUploading(false);
  };

  const createOrderRow = async (extra: Record<string, any> = {}) => {
    const orderItems = cart.map((item) => ({
      product_id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity,
    }));
    const payload: any = {
      items: orderItems, total: grandTotal,
      delivery_method: deliveryMethod, delivery_fee: deliveryFee,
      customer_info: { name: form.name, phone: form.phone, email: form.email, address: form.address },
      notes: form.notes || null,
      payment_method: payMethod,
      ...extra,
    };
    if (user) {
      payload.user_id = user.id;
    } else {
      payload.user_id = null;
      payload.guest_email = form.email;
      payload.guest_phone = form.phone;
    }
    return supabase.from("orders").insert(payload).select("id, guest_token").single();
  };

  const persistGuestOrder = (id: string, token: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem("guest_orders") || "[]");
      existing.push({ id, token, email: form.email, createdAt: new Date().toISOString() });
      localStorage.setItem("guest_orders", JSON.stringify(existing));
    } catch {}
  };

  const handleBankTransferSubmit = async () => {
    if (!screenshotUrl) { toast.error(t("cart.screenshotRequired")); return; }
    if (!form.email || !form.phone) { toast.error("Email and phone are required for invoices & tracking"); return; }
    setSubmitting(true);
    const { data, error } = await createOrderRow({
      payment_screenshot: screenshotUrl,
      payment_status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("cart.orderSuccess"));
    clearCart(); setStep("cart");
    if (user) navigate("/profile");
    else if (data?.guest_token) { persistGuestOrder(data.id as string, data.guest_token as string); navigate("/"); }
  };

  const handleStartCardCheckout = async () => {
    if (!form.email || !form.phone) { toast.error("Email and phone are required"); return; }
    setSubmitting(true);
    const { data, error } = await createOrderRow({ payment_status: "pending" });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    if (!user && data?.guest_token) persistGuestOrder(data.id as string, data.guest_token as string);
    setCardOrderId(data.id as string);
  };

  return (
    <div className="px-5 py-4 md:px-8 md:py-6 md:max-w-3xl md:mx-auto">
      {/* Stepper — progress bar style */}
      <div className="flex items-center gap-1 mb-6">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`h-1 rounded-full flex-1 transition-colors ${i <= stepIndex ? "bg-primary" : "bg-border"}`} />
          </div>
        ))}
      </div>
      <p className="text-micro text-muted-foreground mb-4">
        Step {stepIndex + 1} of {steps.length} — {steps[stepIndex].label}
      </p>

      {/* Step: Cart */}
      {step === "cart" && (
        <div className="animate-fade-in">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-caption text-muted-foreground mb-4 active:scale-95 transition-transform">
            <ArrowLeft className="w-4 h-4" /> {t("cart.continueShopping")}
          </Link>
          <h1 className="text-page-title text-foreground mb-4">
            {t("cart.title")} <span className="text-muted-foreground font-normal text-body">({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          </h1>
          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item.product.id} className="app-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-muted-foreground/30">{item.product.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-body font-semibold text-foreground truncate">{item.product.name}</h3>
                  <p className="text-micro text-muted-foreground">${item.product.price.toLocaleString()} {t("cart.each")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center active:scale-90 transition-transform">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-caption font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center active:scale-90 transition-transform">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-body font-bold text-foreground w-20 text-right">${(item.product.price * item.quantity).toLocaleString()}</span>
                <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors active:scale-90">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="app-card p-4 flex items-center justify-between mb-4">
            <span className="text-body font-semibold text-foreground">{t("cart.total")}</span>
            <span className="text-section-title font-bold text-foreground">${cartTotal.toLocaleString()}</span>
          </div>
          <button onClick={() => setStep("info")} className="btn-primary w-full">{t("cart.checkout")}</button>
        </div>
      )}

      {/* Step: Info */}
      {step === "info" && (
        <div className="app-card p-5 animate-fade-in">
          <h2 className="text-section-title text-foreground mb-2">{t("cart.step.info")}</h2>
          {!user && (
            <div className="mb-4 p-3 rounded-[14px] bg-secondary border border-border flex items-center justify-between gap-3">
              <p className="text-micro text-muted-foreground">Checking out as guest. Your invoice & tracking will be sent to your email and phone.</p>
              <button onClick={() => navigate("/auth")} className="text-micro font-semibold text-primary whitespace-nowrap">Sign in</button>
            </div>
          )}
          <div className="space-y-3">
            {[
              { key: "name", label: t("cart.fullName"), type: "text" },
              { key: "phone", label: t("cart.phone"), type: "tel" },
              { key: "email", label: t("cart.email"), type: "email" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-caption text-muted-foreground mb-1 block">{field.label} *</label>
                <input type={field.type} value={form[field.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="input-field" />
              </div>
            ))}
            <div>
              <label className="text-caption text-muted-foreground mb-1 block">{t("cart.notes")}</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button onClick={() => setStep("cart")} className="btn-secondary flex-1">{t("cart.back")}</button>
            <button onClick={() => {
              if (!form.name || !form.phone || !form.email) { toast.error(t("contact.fillRequired")); return; }
              setStep("delivery");
            }} className="btn-primary flex-1">{t("cart.next")}</button>
          </div>

        </div>
      )}

      {/* Step: Delivery */}
      {step === "delivery" && (
        <div className="app-card p-5 animate-fade-in">
          <h2 className="text-section-title text-foreground mb-4">{t("cart.deliveryMethod")}</h2>
          <div className="space-y-2">
            {([
              { key: "pickup" as const, icon: MapPin, label: t("cart.pickup"), desc: t("cart.pickupDesc"), price: t("cart.free"), priceColor: "text-success" },
              { key: "delivery" as const, icon: Truck, label: t("cart.delivery"), desc: t("cart.deliveryDesc"), price: "₭20,000", priceColor: "text-foreground" },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setDeliveryMethod(opt.key)}
                className={`w-full p-4 rounded-[14px] border-2 text-left flex items-center gap-3 transition-all active:scale-[0.98] ${
                  deliveryMethod === opt.key ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <opt.icon className={`w-5 h-5 ${deliveryMethod === opt.key ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.6} />
                <div className="flex-1">
                  <p className="text-body font-semibold text-foreground">{opt.label}</p>
                  <p className="text-micro text-muted-foreground">{opt.desc}</p>
                </div>
                <span className={`text-caption font-bold ${opt.priceColor}`}>{opt.price}</span>
              </button>
            ))}
          </div>
          {deliveryMethod === "delivery" && (
            <div className="mt-4 animate-fade-in">
              <label className="text-caption text-muted-foreground mb-1 block">{t("cart.address")} *</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                placeholder="House no., street, village, district, city"
                className="input-field resize-none"
              />
            </div>
          )}
          <div className="mt-5 space-y-2 text-caption border-t border-border pt-4">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>${cartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.deliveryFee")}</span><span>{deliveryFee > 0 ? `₭${deliveryFee.toLocaleString()}` : t("cart.free")}</span></div>
            <div className="flex justify-between font-bold text-body pt-2 border-t border-border"><span>{t("cart.grandTotal")}</span><span>${cartTotal.toLocaleString()}{deliveryFee > 0 ? ` + ₭${deliveryFee.toLocaleString()}` : ""}</span></div>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button onClick={() => setStep("info")} className="btn-secondary flex-1">{t("cart.back")}</button>
            <button onClick={() => {
              if (deliveryMethod === "delivery" && !form.address.trim()) { toast.error(t("contact.fillRequired")); return; }
              setStep("payment");
            }} className="btn-primary flex-1">{t("cart.next")}</button>
          </div>

        </div>
      )}

      {/* Step: Payment */}
      {step === "payment" && (
        <div className="app-card p-5 animate-fade-in">
          <h2 className="text-section-title text-foreground mb-1">{t("cart.paymentTitle")}</h2>
          <p className="text-caption text-muted-foreground mb-5">{t("cart.paymentDesc")}</p>
          <div className="w-full max-w-[240px] mx-auto aspect-square rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-secondary mb-5">
            <p className="text-caption text-muted-foreground text-center px-4">{t("cart.qrPlaceholder")}</p>
          </div>
          <div className="space-y-2 text-caption mb-5 app-card p-4">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.subtotal")}</span><span>${cartTotal.toLocaleString()}</span></div>
            {deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("cart.deliveryFee")}</span><span>₭{deliveryFee.toLocaleString()}</span></div>}
            <div className="flex justify-between font-bold text-body pt-2 border-t border-border"><span>{t("cart.grandTotal")}</span><span>${cartTotal.toLocaleString()}{deliveryFee > 0 ? ` + ₭${deliveryFee.toLocaleString()}` : ""}</span></div>
          </div>
          <div className="mb-5">
            {screenshotUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-[14px] border border-success/30 bg-success/5">
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                <img src={screenshotUrl} alt="Payment" className="w-14 h-14 object-cover rounded-xl" />
                <span className="text-caption font-medium flex-1">{t("cart.uploadedScreenshot")}</span>
                <label className="text-micro text-primary cursor-pointer font-medium">
                  {t("cart.changeScreenshot")}
                  <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 p-8 rounded-[14px] border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors active:scale-[0.98]">
                {uploading ? <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" /> : (
                  <>
                    <Upload className="w-7 h-7 text-muted-foreground" />
                    <span className="text-caption font-medium">{t("cart.uploadScreenshot")}</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep("delivery")} className="btn-secondary flex-1">{t("cart.back")}</button>
            <button onClick={handleSubmitOrder} disabled={submitting || uploading} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("cart.submitOrder")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
