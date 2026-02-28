import { Link } from "react-router-dom";
import { User, Package, ChevronRight, Settings, Heart, MapPin, CreditCard, HelpCircle, ShoppingBag, LogOut, LogIn, Globe, ArrowLeft, FileText, Headphones, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Profile() {
  const { cart, cartTotal } = useApp();
  const { user, profile, role, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [showLanguage, setShowLanguage] = useState(false);

  // Language sub-page
  if (showLanguage) {
    return (
      <div className="px-5 py-5 space-y-5 md:max-w-md md:mx-auto md:px-8 md:py-8">
        <button onClick={() => setShowLanguage(false)} className="flex items-center gap-2 text-caption font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("profile.account")}
        </button>
        <h1 className="text-section-title text-foreground">{t("profile.language")}</h1>
        <p className="text-caption text-muted-foreground">{t("profile.languageDesc")}</p>
        <div className="flex flex-col gap-2">
          {([["en", "🇺🇸 English"], ["lo", "🇱🇦 ລາວ"]] as [Language, string][]).map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                language === code
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              <span className="text-body text-foreground">{label}</span>
              {language === code && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="px-5 py-16 space-y-6 md:max-w-md md:mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-page-title text-foreground">{t("profile.welcome")}</h1>
          <p className="text-caption text-muted-foreground mt-2">{t("profile.signInDesc")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/auth">
            <Button className="w-full gap-2 rounded-xl h-11">
              <LogIn className="w-4 h-4" /> {t("profile.signIn")}
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" className="w-full rounded-xl h-11">{t("profile.createAccount")}</Button>
          </Link>
        </div>
        <div className="pt-2">
          <button
            onClick={() => setShowLanguage(true)}
            className="app-card w-full flex items-center justify-between p-4 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-body font-medium text-foreground">{t("profile.language")}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  const sections = [
    {
      title: t("profile.orders") + " & " + "Quotes",
      items: [
        { icon: Package, label: t("profile.orders"), desc: t("profile.ordersDesc"), link: "#orders" },
        { icon: FileText, label: "Quotes", desc: "View quote requests", link: "#" },
        { icon: Headphones, label: "Service Requests", desc: "Track service status", link: "#" },
      ],
    },
    {
      title: t("profile.account"),
      items: [
        { icon: Settings, label: t("profile.accountSettings"), link: "#" },
        { icon: Globe, label: t("profile.language"), onClick: () => setShowLanguage(true) },
        { icon: HelpCircle, label: t("profile.helpSupport"), link: "#" },
        { icon: MessageCircle, label: "FAQ", link: "#" },
      ],
    },
  ];

  return (
    <div className="px-5 py-5 space-y-5 md:max-w-3xl md:mx-auto md:px-8 md:py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-14 h-14 object-cover" />
          ) : (
            <User className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-section-title text-foreground truncate">{displayName}</h1>
          <p className="text-caption text-muted-foreground truncate">{profile?.email}</p>
          {role && (
            <span className="badge-status bg-primary/10 text-primary mt-1 capitalize">
              {role.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Admin Portal */}
      {(role === "approved_admin" || role === "super_admin") && (
        <Link to="/admin" className="app-card-interactive flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-body font-semibold text-foreground block">{t("profile.adminPortal")}</span>
              <span className="text-micro text-muted-foreground">{t("profile.adminPortalDesc")}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Link to="/cart" className="app-card-interactive flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-body font-semibold text-foreground block">
                {cart.length} {cart.length > 1 ? t("profile.itemsInCart") : t("profile.itemInCart")}
              </span>
              <span className="text-micro text-muted-foreground">{t("cart.total")}: ${cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-caption font-semibold text-muted-foreground uppercase tracking-wider mb-2">{section.title}</h2>
          <div className="app-card divide-y divide-border overflow-hidden">
            {section.items.map((item) => {
              const content = (
                <div className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-body font-medium text-foreground block">{item.label}</span>
                      {"desc" in item && item.desc && <span className="text-micro text-muted-foreground">{item.desc}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              );

              if ("onClick" in item && item.onClick) {
                return <button key={item.label} onClick={item.onClick} className="w-full text-left">{content}</button>;
              }
              return <Link key={item.label} to={"link" in item ? (item.link || "#") : "#"} className="block">{content}</Link>;
            })}
          </div>
        </section>
      ))}

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="app-card w-full flex items-center gap-3 p-4 text-destructive hover:bg-destructive/5 transition-colors active:scale-[0.98]"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-body font-medium">{t("profile.signOut")}</span>
      </button>
    </div>
  );
}
