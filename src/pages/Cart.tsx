import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useApp();
  const [showCheckout, setShowCheckout] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="section-padding text-center min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Browse our products and add something you need.</p>
        <Link to="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="max-w-4xl mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold mb-8">Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h1>

        <div className="space-y-3 mb-8">
          {cart.map((item) => (
            <div key={item.product.id} className="tech-card p-4 md:p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="gradient-text font-bold text-lg">{item.product.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate text-sm">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground">${item.product.price.toLocaleString()} each</p>
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

        <div className="tech-card p-6">
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span>Total</span>
            <span className="gradient-text">${cartTotal.toLocaleString()}</span>
          </div>
          {!showCheckout ? (
            <button onClick={() => setShowCheckout(true)} className="btn-primary w-full justify-center">
              Proceed to Checkout
            </button>
          ) : (
            <CheckoutForm onComplete={() => {
              toast.success("Order placed successfully! We'll contact you shortly.");
              clearCart();
              setShowCheckout(false);
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ onComplete }: { onComplete: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <h3 className="font-semibold text-lg">Checkout</h3>
      {[
        { key: "name", label: "Full Name", type: "text", required: true },
        { key: "phone", label: "Phone Number", type: "tel", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "address", label: "Delivery Address", type: "text", required: true },
      ].map((field) => (
        <div key={field.key}>
          <label className="text-sm text-muted-foreground mb-1 block">{field.label} {field.required && "*"}</label>
          <input type={field.type} value={form[field.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} className="input-field" />
        </div>
      ))}
      <div>
        <label className="text-sm text-muted-foreground mb-1 block">Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input-field resize-none" />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">Place Order</button>
    </form>
  );
}
