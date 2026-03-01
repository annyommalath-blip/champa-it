import { Link } from "react-router-dom";
import { User, Package, ChevronRight, Settings, HelpCircle, ShoppingBag, LogOut, LogIn, Globe, ArrowLeft, FileText, Headphones, MessageCircle, Receipt, Bookmark } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useState } from "react";

export default function Profile() {
  const { cart, cartTotal } = useApp();
  const { user, profile, role, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [showLanguage, setShowLanguage] = useState(false);

  if (showLanguage) {
    return (
      <div className="px-5 py-6 space-y-5 md:max-w-md md:mx-auto md:px-8">
        <button onClick={() => setShowLanguage(false)} className="flex items-center gap-1.5 text-caption text-muted-foreground active:scale-95 transition-transform">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-section-title text-foreground">{t("profile.language")}</h1>
        <p className="text-caption text-muted-foreground">{t("profile.languageDesc")}</p>
        <div className="flex flex-col gap-2.5">
          {([["en", "🇺🇸 English"], ["lo", "🇱🇦 ລາວ"]] as [Language, string][]).map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`w-full flex items-center justify-between p-4 rounded-[14px] border-2 transition-all active:scale-[0.98] ${
                language === code
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-border bg-card"
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

  if (!user) {
    return (
      <div className="px-5 py-20 space-y-6 md:max-w-sm md:mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.4} />
        </div>
        <div>
          <h1 className="text-page-title text-foreground">{t("profile.welcome")}</h1>
          <p className="text-caption text-muted-foreground mt-2">{t("profile.signInDesc")}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Link to="/auth">
            <button className="btn-primary w-full gap-2">
              <LogIn className="w-4 h-4" /> {t("profile.signIn")}
            </button>
          </Link>
          <Link to="/auth">
            <button className="btn-outline w-full">{t("profile.createAccount")}</button>
          </Link>
        </div>
        <button onClick={() => setShowLanguage(true)} className="app-card w-full flex items-center justify-between p-4 mt-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-body font-medium text-foreground">{t("profile.language")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  const sections = [
    {
      title: "Activity",
      items: [
        { icon: Package, label: t("profile.orders"), desc: "View & track orders", link: "#" },
        { icon: FileText, label: "Quotes", desc: "View quote requests", link: "#" },
        { icon: Headphones, label: "Service Requests", desc: "Track service status", link: "#" },
        { icon: Bookmark, label: "Saved Items", desc: "Bookmarked products", link: "#" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: Settings, label: t("profile.accountSettings"), link: "#" },
        { icon: Receipt, label: "Billing & Invoices", link: "#" },
        { icon: Globe, label: t("profile.language"), onClick: () => setShowLanguage(true) },
      ],
    },
    {
      title: "Help",
      items: [
        { icon: HelpCircle, label: "FAQ", link: "#" },
        { icon: MessageCircle, label: "Contact Support", link: "/chat" },
      ],
    },
  ];

  return (
    <div className="px-5 py-6 space-y-6 md:max-w-3xl md:mx-auto md:px-8 md:py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-14 h-14 object-cover" />
          ) : (
            <span className="text-xl font-bold text-muted-foreground/40">{displayName.charAt(0).toUpperCase()}</span>
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

      {/* Admin */}
      {(role === "approved_admin" || role === "super_admin") && (
        <Link to="/admin" className="app-card-interactive flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <div>
              <span className="text-body font-semibold text-foreground block">{t("profile.adminPortal")}</span>
              <span className="text-micro text-muted-foreground">{t("profile.adminPortalDesc")}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <Link to="/cart" className="app-card-interactive flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" strokeWidth={1.5} />
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
          <h2 className="text-micro font-semibold text-muted-foreground uppercase tracking-widest mb-2.5 px-1">{section.title}</h2>
          <div className="app-card divide-y divide-border/50 overflow-hidden">
            {section.items.map((item) => {
              const inner = (
                <div className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors active:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <span className="text-body font-medium text-foreground block">{item.label}</span>
                      {"desc" in item && item.desc && <span className="text-micro text-muted-foreground">{item.desc}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
              );

              if ("onClick" in item && item.onClick) {
                return <button key={item.label} onClick={item.onClick} className="w-full text-left">{inner}</button>;
              }
              return <Link key={item.label} to={"link" in item ? (item.link || "#") : "#"} className="block">{inner}</Link>;
            })}
          </div>
        </section>
      ))}

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="w-full flex items-center gap-3 p-4 rounded-2xl text-destructive hover:bg-destructive/5 transition-colors active:scale-[0.98]"
      >
        <LogOut className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-body font-medium">{t("profile.signOut")}</span>
      </button>
    </div>
  );
}
