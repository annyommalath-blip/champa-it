import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, MapPin, Truck, Upload, CheckCircle, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DELIVERY_FEE = 20000; // 20,000 LAK flat

type Step = "cart" | "info" | "delivery" | "payment";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useApp();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = deliveryMethod === "delivery" ? DELIVERY_FEE : 0;
  const grandTotal = cartTotal + deliveryFee;

  if (cart.length === 0 && step === "cart") {
    return (
      <div className="section-padding text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("cart.empty")}</h2>
        <p className="text-muted-foreground mb-6">{t("cart.emptyDesc")}</p>
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
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("payment-screenshots").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("payment-screenshots").getPublicUrl(path);
    setScreenshotUrl(pub.publicUrl);
    setUploading(false);
  };

  const handleSubmitOrder = async () => {
    if (!user) { toast.error(t("cart.loginRequired")); navigate("/auth"); return; }
    if (!screenshotUrl) { toast.error(t("cart.screenshotRequired")); return; }

    setSubmitting(true);
    const orderItems = cart.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      items: orderItems,
      total: grandTotal,
      delivery_method: deliveryMethod,
      delivery_fee: deliveryFee,
      payment_screenshot: screenshotUrl,
      customer_info: { name: form.name, phone: form.phone, email: form.email, address: form.address },
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("cart.orderSuccess"));
    clearCart();
    setStep("cart");
    navigate("/profile");
  };

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <button
                onClick={() => i < stepIndex && setStep(s.key)}
                disabled={i > stepIndex}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === stepIndex
                    ? "bg-primary text-primary-foreground"
                    : i < stepIndex
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-[10px] font-bold">
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step: Cart */}
        {step === "cart" && (
          <>
            <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" /> {t("cart.continueShopping")}
            </Link>
            <h1 className="text-3xl font-bold mb-6">{t("cart.title")} ({cart.reduce((s, i) => s + i.quantity, 0)} {t("cart.items")})</h1>
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="tech-card p-4 md:p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="gradient-text font-bold text-lg">{item.product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-sm">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">${item.product.price.toLocaleString()} {t("cart.each")}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-secondary">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-secondary">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold w-24 text-right text-sm">${(item.product.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="tech-card p-6 flex items-center justify-between">
              <span className="text-lg font-bold">{t("cart.total")}</span>
              <span className="text-lg font-bold gradient-text">${cartTotal.toLocaleString()}</span>
            </div>
            <button onClick={() => setStep("info")} className="btn-primary w-full justify-center mt-4">
              {t("cart.checkout")}
            </button>
          </>
        )}

        {/* Step: Customer Info */}
        {step === "info" && (
          <div className="tech-card p-6">
            <h2 className="text-xl font-bold mb-4">{t("cart.step.info")}</h2>
            <div className="space-y-4">
              {[
                { key: "name", label: t("cart.fullName"), type: "text" },
                { key: "phone", label: t("cart.phone"), type: "tel" },
                { key: "email", label: t("cart.email"), type: "email" },
                { key: "address", label: t("cart.address"), type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-muted-foreground mb-1 block">{field.label} *</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">{t("cart.notes")}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("cart")} className="btn-primary bg-secondary text-foreground hover:bg-secondary/80 flex-1 justify-center">
                {t("cart.back")}
              </button>
              <button
                onClick={() => {
                  if (!form.name || !form.phone || !form.email || !form.address) {
                    toast.error(t("contact.fillRequired"));
                    return;
                  }
                  setStep("delivery");
                }}
                className="btn-primary flex-1 justify-center"
              >
                {t("cart.next")}
              </button>
            </div>
          </div>
        )}

        {/* Step: Delivery Method */}
        {step === "delivery" && (
          <div className="tech-card p-6">
            <h2 className="text-xl font-bold mb-4">{t("cart.deliveryMethod")}</h2>
            <div className="space-y-3">
              <button
                onClick={() => setDeliveryMethod("pickup")}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                  deliveryMethod === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === "pickup" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t("cart.pickup")}</p>
                  <p className="text-xs text-muted-foreground">{t("cart.pickupDesc")}</p>
                </div>
                <span className="text-sm font-bold text-green-500">{t("cart.free")}</span>
              </button>

              <button
                onClick={() => setDeliveryMethod("delivery")}
                className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                  deliveryMethod === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === "delivery" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t("cart.delivery")}</p>
                  <p className="text-xs text-muted-foreground">{t("cart.deliveryDesc")}</p>
                </div>
                <span className="text-sm font-bold">₭20,000</span>
              </button>
            </div>

            {/* Order summary */}
            <div className="mt-6 space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.deliveryFee")}</span>
                <span>{deliveryFee > 0 ? `₭${deliveryFee.toLocaleString()}` : t("cart.free")}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>{t("cart.grandTotal")}</span>
                <span className="gradient-text">${cartTotal.toLocaleString()}{deliveryFee > 0 ? ` + ₭${deliveryFee.toLocaleString()}` : ""}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("info")} className="btn-primary bg-secondary text-foreground hover:bg-secondary/80 flex-1 justify-center">
                {t("cart.back")}
              </button>
              <button onClick={() => setStep("payment")} className="btn-primary flex-1 justify-center">
                {t("cart.next")}
              </button>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <div className="tech-card p-6">
            <h2 className="text-xl font-bold mb-2">{t("cart.paymentTitle")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("cart.paymentDesc")}</p>

            {/* QR Code placeholder */}
            <div className="w-full max-w-xs mx-auto aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 mb-6">
              <p className="text-sm text-muted-foreground text-center px-4">{t("cart.qrPlaceholder")}</p>
            </div>

            {/* Amount summary */}
            <div className="space-y-2 text-sm mb-6 border rounded-xl p-4 border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.deliveryFee")}</span>
                  <span>₭{deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>{t("cart.grandTotal")}</span>
                <span className="gradient-text">${cartTotal.toLocaleString()}{deliveryFee > 0 ? ` + ₭${deliveryFee.toLocaleString()}` : ""}</span>
              </div>
            </div>

            {/* Screenshot upload */}
            <div className="mb-6">
              {screenshotUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <img src={screenshotUrl} alt="Payment" className="w-16 h-16 object-cover rounded-lg" />
                  <span className="text-sm font-medium flex-1">{t("cart.uploadedScreenshot")}</span>
                  <label className="text-xs text-primary cursor-pointer hover:underline">
                    {t("cart.changeScreenshot")}
                    <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">{t("cart.uploadScreenshot")}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("delivery")} className="btn-primary bg-secondary text-foreground hover:bg-secondary/80 flex-1 justify-center">
                {t("cart.back")}
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || uploading}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("cart.submitOrder")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
