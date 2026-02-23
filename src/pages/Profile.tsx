import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Package, ChevronRight, Settings, Heart, MapPin, CreditCard, HelpCircle, ShoppingBag, Truck, CheckCircle, RotateCcw } from "lucide-react";
import { useApp } from "@/context/AppContext";

const mockOrders = [
  { id: "ORD-2024-001", product: "Champa X1 Pro Server", status: "Delivered", date: "Feb 20, 2026", initial: "C" },
  { id: "ORD-2024-002", product: "SecureNet Firewall 500", status: "Shipped", date: "Feb 22, 2026", initial: "S" },
  { id: "ORD-2024-003", product: "CloudOps Monitoring", status: "Processing", date: "Feb 23, 2026", initial: "C" },
];

const statusIcon: Record<string, typeof CheckCircle> = {
  Delivered: CheckCircle,
  Shipped: Truck,
  Processing: RotateCcw,
};

const statusColor: Record<string, string> = {
  Delivered: "text-green-600",
  Shipped: "text-primary",
  Processing: "text-muted-foreground",
};

const quickLinks = [
  { icon: Package, label: "Orders", desc: "Track & manage", link: "#orders" },
  { icon: Heart, label: "Wishlist", desc: "Saved items", link: "/shop" },
  { icon: MapPin, label: "Addresses", desc: "Shipping info", link: "#" },
  { icon: CreditCard, label: "Payments", desc: "Cards & billing", link: "#" },
];

const accountItems = [
  { icon: Settings, label: "Account Settings" },
  { icon: HelpCircle, label: "Help & Support" },
  { icon: ShoppingBag, label: "Buy Again" },
];

export default function Profile() {
  const { cart, cartTotal } = useApp();
  const [userName] = useState(() => {
    return localStorage.getItem("champa_guest_name") || "Guest";
  });

  return (
    <div className="px-5 py-5 space-y-6 md:max-w-3xl md:mx-auto md:px-8 md:py-8">

      {/* Greeting */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <User className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Hello, {userName}</h1>
          <p className="text-sm text-muted-foreground">Welcome back to Champa</p>
        </div>
      </div>

      {/* Quick Links - pill row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
        {quickLinks.map((item) => (
          <Link
            key={item.label}
            to={item.link}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
          >
            <item.icon className="w-4 h-4 text-primary" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Your Orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Your Orders</h2>
          <Link to="/shop" className="text-xs font-medium text-primary flex items-center gap-0.5">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {mockOrders.map((order) => {
            const StatusIcon = statusIcon[order.status] || Package;
            return (
              <div key={order.id} className="app-card flex-shrink-0 w-56 p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <StatusIcon className={`w-4 h-4 ${statusColor[order.status]}`} />
                  <span className={`text-sm font-semibold ${statusColor[order.status]}`}>{order.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{order.date}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="gradient-text font-bold text-lg">{order.initial}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{order.product}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{order.id}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Link to="/cart" className="app-card flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground block">{cart.length} item{cart.length > 1 ? "s" : ""} in cart</span>
              <span className="text-xs text-muted-foreground">Total: ${cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      )}

      {/* Account */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3">Account</h2>
        <div className="space-y-2">
          {accountItems.map((item) => (
            <button key={item.label} className="app-card w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* Savings */}
      <div className="app-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">${cartTotal > 0 ? Math.round(cartTotal * 0.12).toLocaleString() : "0"}</span>
          <span className="text-sm text-muted-foreground">Your savings with Champa</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}
