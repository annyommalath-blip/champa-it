import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, Wrench, Bell, User, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import logo from "@/assets/logo.jpg";

const navKeys = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/shop", labelKey: "nav.shop", icon: ShoppingBag },
  { to: "/services", labelKey: "nav.services", icon: Wrench },
  { to: "/chat", labelKey: "nav.chat", icon: MessageCircle },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { cartCount } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop nav */}
      <header className="hidden md:block sticky top-0 z-50 border-b border-border/50 glass-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="Champa Enterprise" className="h-8 w-8 rounded-xl object-cover" />
            <span className="font-bold text-[17px] tracking-tight text-foreground">Champa</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {navKeys.map((item) => {
              const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active ? "bg-foreground/[0.05] text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
            <div className="w-px h-5 bg-border mx-2" />
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-foreground/[0.04] transition-all">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" strokeWidth={1.7} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1 ring-2 ring-background">
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

      {/* Mobile top bar */}
      <header className="md:hidden px-5 h-[52px] glass-header sticky top-0 z-50 border-b border-border/40 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Champa" className="h-7 w-7 rounded-[10px] object-cover" />
          <span className="font-semibold text-[15px] text-foreground tracking-tight">Champa</span>
        </Link>
        <div className="flex items-center gap-0.5">
          <Link to="/cart" className="relative p-2.5 rounded-xl active:scale-90 transition-transform">
            <ShoppingCart className="w-[20px] h-[20px] text-foreground/70" strokeWidth={1.7} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold px-0.5">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/notifications" className="p-2.5 rounded-xl active:scale-90 transition-transform">
            <Bell className="w-[20px] h-[20px] text-foreground/70" strokeWidth={1.7} />
          </Link>
        </div>
      </header>

      <main className="flex-1 md:pb-0 pb-[72px]">{children}</main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-border/40 safe-area-bottom">
        <div className="flex items-center justify-around h-[64px] px-1">
          {navKeys.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center gap-[3px] py-1.5 min-w-[56px] transition-all active:scale-90"
              >
                <div className={`relative ${active ? "" : ""}`}>
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                    strokeWidth={active ? 2 : 1.6}
                  />
                  {active && (
                    <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] font-medium leading-none ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop footer */}
      <footer className="hidden md:block border-t border-border/50 bg-card">
        <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Champa" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-lg">Champa</span>
            </div>
            <p className="text-caption text-muted-foreground leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="text-micro font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("footer.products")}</h4>
            <div className="flex flex-col gap-2.5 text-caption">
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.serversHardware")}</Link>
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.networking")}</Link>
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.security")}</Link>
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.software")}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-micro font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("footer.services")}</h4>
            <div className="flex flex-col gap-2.5 text-caption">
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.itConsulting")}</Link>
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.cloudMigration")}</Link>
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.managedIT")}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-micro font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("footer.company")}</h4>
            <div className="flex flex-col gap-2.5 text-caption">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.aboutUs")}</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.contactSales")}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 px-8 py-4 text-center text-micro text-muted-foreground">
          © {new Date().getFullYear()} Champa Private Enterprise. {t("footer.rights")}
        </div>
      </footer>
    </div>
  );
}
