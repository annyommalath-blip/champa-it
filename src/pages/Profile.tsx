import { Link } from "react-router-dom";
import { User, Package, ChevronRight, Settings, Heart, MapPin, CreditCard, HelpCircle, ShoppingBag, LogOut, LogIn, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { cart, cartTotal } = useApp();
  const { user, profile, role, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Not logged in — show sign in prompt
  if (!user) {
    return (
      <div className="px-5 py-16 space-y-6 md:max-w-md md:mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("profile.welcome")}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t("profile.signInDesc")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/auth">
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <LogIn className="w-4 h-4" /> {t("profile.signIn")}
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" className="w-full">{t("profile.createAccount")}</Button>
          </Link>
        </div>

        {/* Language selector even for guests */}
        <div className="pt-4">
          <LanguageSelector language={language} setLanguage={setLanguage} t={t} />
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  const quickLinks = [
    { icon: Package, label: t("profile.orders"), desc: t("profile.ordersDesc"), link: "#orders" },
    { icon: Heart, label: t("profile.wishlist"), desc: t("profile.wishlistDesc"), link: "/shop" },
    { icon: MapPin, label: t("profile.addresses"), desc: t("profile.addressesDesc"), link: "#" },
    { icon: CreditCard, label: t("profile.payments"), desc: t("profile.paymentsDesc"), link: "#" },
  ];

  const accountItems = [
    { icon: Settings, label: t("profile.accountSettings") },
    { icon: HelpCircle, label: t("profile.helpSupport") },
    { icon: ShoppingBag, label: t("profile.buyAgain") },
  ];

  return (
    <div className="px-5 py-5 space-y-6 md:max-w-3xl md:mx-auto md:px-8 md:py-8">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("profile.hello")}, {displayName}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {role && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                {role.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
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

      {/* Admin Portal link */}
      {(role === "approved_admin" || role === "super_admin") && (
        <Link to="/admin" className="app-card flex items-center justify-between p-4 border-primary/20 hover:border-primary/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground block">{t("profile.adminPortal")}</span>
              <span className="text-xs text-muted-foreground">{t("profile.adminPortalDesc")}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Link to="/cart" className="app-card flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground block">
                {cart.length} {cart.length > 1 ? t("profile.itemsInCart") : t("profile.itemInCart")}
              </span>
              <span className="text-xs text-muted-foreground">{t("cart.total")}: ${cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      )}

      {/* Account */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3">{t("profile.account")}</h2>
        <div className="space-y-2">
          {accountItems.map((item) => (
            <button key={item.label} className="app-card w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}

          {/* Language Setting */}
          <LanguageSelector language={language} setLanguage={setLanguage} t={t} />
        </div>
      </section>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="app-card w-full flex items-center gap-3 p-4 text-destructive hover:bg-destructive/5 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium">{t("profile.signOut")}</span>
      </button>
    </div>
  );
}

function LanguageSelector({ language, setLanguage, t }: { language: Language; setLanguage: (l: Language) => void; t: (k: string) => string }) {
  return (
    <div className="app-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <span className="text-sm font-medium text-foreground block">{t("profile.language")}</span>
          <span className="text-xs text-muted-foreground">{t("profile.languageDesc")}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage("en")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            language === "en"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          🇺🇸 English
        </button>
        <button
          onClick={() => setLanguage("lo")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            language === "lo"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          🇱🇦 ລາວ
        </button>
      </div>
    </div>
  );
}
