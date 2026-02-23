import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, LayoutDashboard, ShoppingCart, Wrench, Menu, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import logo from "@/assets/logo.jpg";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/services", label: "Services", icon: Wrench },
  { to: "/contact", label: "Contact", icon: MessageCircle },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { cartCount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Announcement bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 via-primary to-primary/90 text-primary-foreground text-xs text-center py-2 px-4 font-semibold tracking-wide">
        <span className="relative z-10">
          🔥 Free shipping on orders over $1,000 — <Link to="/shop" className="underline underline-offset-2 font-bold">Shop Now</Link>
        </span>
      </div>

      {/* Desktop nav */}
      <header className="hidden md:block sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Champa Enterprise" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border group-hover:ring-primary/50 transition-all" />
            <div className="leading-tight">
              <span className="font-bold text-lg tracking-tight">Champa</span>
              <span className="block text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Enterprise</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-border mx-2" />
            <Link to="/cart" className="relative p-2.5 rounded-lg hover:bg-secondary/50 transition-all group">
              <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold ring-2 ring-background">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile nav */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/90 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Champa" className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-bold text-lg tracking-tight">Champa</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/cart" className="relative p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-secondary/50">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3 space-y-1 z-40 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 py-14 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="Champa" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <span className="font-bold text-lg">Champa</span>
                <span className="block text-[10px] text-muted-foreground tracking-widest uppercase">Enterprise</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Best Service Mind With Reasonable Price. Your trusted partner for enterprise technology solutions.</p>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Products</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">Servers & Hardware</Link>
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">Networking</Link>
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">Security</Link>
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">Software</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Services</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">IT Consulting</Link>
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">Cloud Migration</Link>
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">Managed IT</Link>
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">Get a Quote</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/" className="text-secondary-foreground hover:text-primary transition-colors">About Us</Link>
              <Link to="/contact" className="text-secondary-foreground hover:text-primary transition-colors">Contact Sales</Link>
              <Link to="/dashboard" className="text-secondary-foreground hover:text-primary transition-colors">Partner Portal</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Champa Private Enterprise. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
