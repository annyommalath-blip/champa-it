import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, LayoutDashboard, ShoppingCart, FileText, Menu, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import logo from "@/assets/logo.jpg";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/services", label: "Services", icon: FileText },
  { to: "/contact", label: "Contact", icon: MessageCircle },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { cartCount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar - promo strip */}
      <div className="bg-navy text-white text-xs text-center py-2 px-4 font-medium">
        🔥 Free shipping on orders over $1,000 — <Link to="/shop" className="underline underline-offset-2">Shop Now</Link>
      </div>

      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-8 py-3 border-b border-border bg-card sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Champa Enterprise" className="h-10 w-10 rounded-lg object-cover" />
          <div className="leading-tight">
            <span className="font-bold text-lg tracking-tight text-foreground">Champa</span>
            <span className="block text-[10px] text-muted-foreground tracking-wide uppercase">Enterprise Solutions</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link to="/cart" className="relative ml-3 p-2.5 rounded-lg hover:bg-muted transition-colors">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </header>

      {/* Mobile top nav */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Champa Enterprise" className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-bold text-lg tracking-tight">Champa</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-3 space-y-1 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Champa Enterprise" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <span className="font-bold text-lg">Champa</span>
                <span className="block text-xs text-white/60">Enterprise Solutions</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">Best Service Mind With Reasonable Price. Your trusted partner for enterprise technology.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-white/80">Products</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link to="/shop" className="hover:text-white transition-colors">Servers & Hardware</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Networking</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Security</Link>
              <Link to="/shop" className="hover:text-white transition-colors">Software</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-white/80">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link to="/services" className="hover:text-white transition-colors">IT Consulting</Link>
              <Link to="/services" className="hover:text-white transition-colors">Cloud Migration</Link>
              <Link to="/services" className="hover:text-white transition-colors">Managed IT</Link>
              <Link to="/services" className="hover:text-white transition-colors">Get a Quote</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-white/80">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link to="/" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact Sales</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">Partner Portal</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Champa Private Enterprise. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
