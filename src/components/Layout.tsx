import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Wrench, User, MessageCircle, ShoppingCart, Bell, Headphones } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ChatWidget from "@/components/ChatWidget";
import logo from "@/assets/logo.jpg";


const navKeys = [
  { to: "/", labelKey: "nav.home", icon: Home },
  { to: "/shop", labelKey: "nav.shop", icon: ShoppingBag },
  { to: "/services", labelKey: "nav.services", icon: Wrench },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

const desktopNavKeys = [
  ...navKeys.slice(0, 3),
  { to: "/chat", labelKey: "nav.chat", icon: MessageCircle },
  navKeys[3],
];


export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { cartCount } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);


  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop nav */}
      <header className="hidden md:block sticky top-0 z-50 glass-header border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 h-[56px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="Champa Enterprise" className="h-8 w-8 rounded-xl object-cover shadow-sm" />
            <span className="font-extrabold text-[17px] tracking-tight text-foreground">Champa</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            {desktopNavKeys.map((item) => {

              const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
            <div className="w-px h-5 bg-border mx-3" />
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-secondary/60 transition-all active:scale-90">
              <ShoppingCart className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold px-1 ring-2 ring-background">
                  {cartCount}
                </span>
              )}
            </Link>
            {!user && (
              <Link to="/auth" className="ml-2 btn-primary text-[13px] py-2 px-5">
                {t("nav.signIn")}
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden px-5 h-[48px] glass-header sticky top-0 z-50 border-b border-border/30 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Champa" className="h-7 w-7 rounded-[10px] object-cover" />
          <span className="font-bold text-[15px] text-foreground tracking-tight">Champa</span>
        </Link>
        <div className="flex items-center gap-0">
          <Link to="/cart" className="relative p-2 rounded-xl active:scale-90 transition-transform">
            <ShoppingCart className="w-[18px] h-[18px] text-foreground/50" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold px-0.5">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/notifications" className="p-2 rounded-xl active:scale-90 transition-transform">
            <Bell className="w-[18px] h-[18px] text-foreground/50" strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      <main className="flex-1 md:pb-0 pb-[72px]">{children}</main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-border/30 safe-area-bottom">
        <div className="flex items-center justify-around h-[64px] px-2">
          {navKeys.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center gap-1 py-1 min-w-[48px] transition-all active:scale-90"
              >
                <Icon
                  className={`w-[20px] h-[20px] transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground/50"
                  }`}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                <span className={`text-[10px] font-semibold leading-none tracking-tight ${
                  active ? "text-foreground" : "text-muted-foreground/40"
                }`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating chat FAB — hidden on chat & admin routes */}
      {!location.pathname.startsWith("/chat") && !location.pathname.startsWith("/admin") && (
        <Link
          to="/chat"
          aria-label={t("nav.chat")}
          className="md:hidden fixed right-4 bottom-[84px] z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-background"
        >
          <Headphones className="w-6 h-6" strokeWidth={2} />
        </Link>
      )}



      {/* Desktop footer */}
      <footer className="hidden md:block border-t border-border/30 bg-card">
        <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Champa" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-extrabold text-lg tracking-tight">Champa</span>
            </div>
            <p className="text-caption text-muted-foreground leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="text-micro font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">{t("footer.products")}</h4>
            <div className="flex flex-col gap-2.5 text-caption">
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.serversHardware")}</Link>
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.networking")}</Link>
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.security")}</Link>
              <Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.software")}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-micro font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">{t("footer.services")}</h4>
            <div className="flex flex-col gap-2.5 text-caption">
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.itConsulting")}</Link>
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.cloudMigration")}</Link>
              <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.managedIT")}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-micro font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">{t("footer.company")}</h4>
            <div className="flex flex-col gap-2.5 text-caption">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.aboutUs")}</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.contactSales")}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 px-8 py-4 text-center text-micro text-muted-foreground/50">
          © {new Date().getFullYear()} Champa Private Enterprise. {t("footer.rights")}
        </div>
      </footer>
    </div>
  );
}
