import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, Wrench, Bell, User, Headphones, X, MessageSquare, Phone } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect, useCallback } from "react";
import logo from "@/assets/logo.jpg";
import ChatPopup from "@/components/ChatPopup";

const navKeys = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/shop", labelKey: "nav.shop", icon: ShoppingBag },
  { to: "/services", labelKey: "nav.services", icon: Wrench },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { cartCount } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [supportOpen, setSupportOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const supportRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-hide FAB on scroll down
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setFabVisible(y < lastScrollY.current || y < 100);
    lastScrollY.current = y;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop nav */}
      <header className="hidden md:block sticky top-0 z-50 border-b border-border glass-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Champa Enterprise" className="h-9 w-9 rounded-xl object-cover ring-1 ring-border group-hover:ring-primary/50 transition-all" />
            <div className="leading-tight">
              <span className="font-bold text-lg tracking-tight">Champa</span>
              <span className="block text-micro text-muted-foreground tracking-widest uppercase font-medium">Enterprise</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {navKeys.map((item) => {
              const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
            <div className="w-px h-6 bg-border mx-2" />
            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-secondary transition-all group">
              <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-micro flex items-center justify-center font-bold ring-2 ring-background">
                  {cartCount}
                </span>
              )}
            </Link>
            {!user && (
              <Link to="/auth" className="ml-2 btn-primary text-sm py-2 px-4">
                {t("nav.signIn")}
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile header — clean white, no yellow */}
      <header className="md:hidden px-5 pt-3 pb-2.5 glass-header sticky top-0 z-50 border-b border-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Champa" className="h-9 w-9 rounded-xl object-cover" />
            <div className="leading-tight">
              <span className="font-semibold text-[15px] text-foreground tracking-tight">Champa</span>
              <span className="block text-[9px] text-muted-foreground tracking-widest uppercase font-medium">Enterprise</span>
            </div>
          </Link>
          <div className="flex items-center gap-0.5">
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
              <ShoppingCart className="w-[22px] h-[22px] text-foreground/70" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
              <Bell className="w-[22px] h-[22px] text-foreground/70" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 md:pb-0 pb-20">{children}</main>

      {/* Chat popup */}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}

      {/* Floating support — auto hides on scroll */}
      {!chatOpen && (
        <div
          ref={supportRef}
          className={`md:hidden fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${
            fabVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          {supportOpen && (
            <div className="bg-card rounded-2xl border border-border shadow-lg p-1.5 w-52 animate-fade-in">
              <button
                onClick={() => { setSupportOpen(false); setChatOpen(true); }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold text-foreground block">{t("support.liveAgent")}</span>
                  <span className="text-micro text-muted-foreground">{t("support.chatWithSupport")}</span>
                </div>
              </button>
              <Link
                to="/contact"
                onClick={() => setSupportOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-semibold text-foreground block">{t("support.contactSales")}</span>
                  <span className="text-micro text-muted-foreground">{t("support.getAQuote")}</span>
                </div>
              </Link>
            </div>
          )}
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className="w-12 h-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center transition-transform active:scale-90"
          >
            {supportOpen ? <X className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navKeys.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all active:scale-90"
              >
                <Icon
                  className={`w-[22px] h-[22px] transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span className={`text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - desktop only */}
      <footer className="hidden md:block border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 py-14 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logo} alt="Champa" className="w-9 h-9 rounded-xl object-cover" />
              <div>
                <span className="font-bold text-lg">Champa</span>
                <span className="block text-micro text-muted-foreground tracking-widest uppercase">Enterprise</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">{t("footer.products")}</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.serversHardware")}</Link>
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.networking")}</Link>
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.security")}</Link>
              <Link to="/shop" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.software")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">{t("footer.services")}</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.itConsulting")}</Link>
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.cloudMigration")}</Link>
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.managedIT")}</Link>
              <Link to="/services" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.getAQuote")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">{t("footer.company")}</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.aboutUs")}</Link>
              <Link to="/contact" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.contactSales")}</Link>
              <Link to="/profile" className="text-secondary-foreground hover:text-primary transition-colors">{t("footer.myProfile")}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Champa Private Enterprise. {t("footer.rights")}
        </div>
      </footer>
    </div>
  );
}
