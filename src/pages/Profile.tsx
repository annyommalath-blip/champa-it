import { Link } from "react-router-dom";
import { User, Package, ChevronRight, Settings, HelpCircle, LogOut, LogIn, Globe, ArrowLeft, FileText, Headphones, MessageCircle, Receipt, Bookmark } from "lucide-react";
import RecentActivity from "@/components/RecentActivity";
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
      <div className="px-5 py-5 space-y-5 md:max-w-md md:mx-auto md:px-8 animate-fade-in">
        <button onClick={() => setShowLanguage(false)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground active:scale-95 transition-transform font-medium">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Back
        </button>
        <h1 className="text-section-title text-foreground">{t("profile.language")}</h1>
        <div className="flex flex-col gap-2">
          {([["en", "🇺🇸 English"], ["lo", "🇱🇦 ລາວ"]] as [Language, string][]).map(([code, label]) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-[1.5px] transition-all active:scale-[0.98] ${
                language === code
                  ? "border-foreground bg-foreground/[0.02]"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-[14px] font-semibold text-foreground">{label}</span>
              {language === code && <div className="w-2 h-2 rounded-full bg-foreground" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-5 py-16 space-y-7 md:max-w-sm md:mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mesh-gradient">
          <User className="w-8 h-8 text-muted-foreground/15" strokeWidth={1.4} />
        </div>
        <div>
          <h1 className="text-page-title text-foreground">{t("profile.welcome")}</h1>
          <p className="text-caption text-muted-foreground/60 mt-2">{t("profile.signInDesc")}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Link to="/auth">
            <button className="btn-primary w-full gap-2">
              <LogIn className="w-4 h-4" strokeWidth={2} /> {t("profile.signIn")}
            </button>
          </Link>
          <Link to="/auth">
            <button className="btn-outline w-full">{t("profile.createAccount")}</button>
          </Link>
        </div>
        <button onClick={() => setShowLanguage(true)} className="bento-card w-full flex items-center justify-between p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <Globe className="w-[18px] h-[18px] text-muted-foreground/40" strokeWidth={1.8} />
            <span className="text-[14px] font-semibold text-foreground">{t("profile.language")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/20" />
        </button>
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  const sections = [
    {
      title: "Activity",
      items: [
        { icon: Package, label: t("profile.orders"), desc: "View & track orders", link: "/profile/orders" },
        { icon: FileText, label: "Quotes", desc: "View quote requests", link: "/profile/quotes" },
        { icon: Headphones, label: "Service Requests", desc: "Track service status", link: "/profile/service-requests" },
        { icon: Bookmark, label: "Saved Items", desc: "Bookmarked products", link: "/profile/saved" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: Settings, label: t("profile.accountSettings"), link: "/profile/settings" },
        { icon: Receipt, label: "Billing & Invoices", link: "/profile/billing" },
        { icon: Globe, label: t("profile.language"), onClick: () => setShowLanguage(true) },
      ],
    },
    {
      title: "Help",
      items: [
        { icon: HelpCircle, label: "FAQ", link: "/profile/faq" },
        { icon: MessageCircle, label: "Contact Support", link: "/chat" },
      ],
    },
  ];

  return (
    <div className="px-5 py-5 space-y-6 md:max-w-3xl md:mx-auto md:px-8 md:py-8 animate-fade-in">
      {/* Profile header */}
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-14 h-14 object-cover" />
          ) : (
            <span className="text-lg font-black text-background">{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-bold text-foreground truncate tracking-tight">{displayName}</h1>
          <p className="text-caption text-muted-foreground/50 truncate">{profile?.email}</p>
          {role && (
            <span className="badge-status bg-primary/10 text-primary mt-1 capitalize text-[9px]">
              {role.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Admin link */}
      {(role === "approved_admin" || role === "super_admin") && (
        <Link to="/admin" className="bento-card flex items-center justify-between p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <Settings className="w-[18px] h-[18px] text-primary" strokeWidth={1.8} />
            <div>
              <span className="text-[14px] font-bold text-foreground block tracking-tight">{t("profile.adminPortal")}</span>
              <span className="text-[11px] text-muted-foreground/40">{t("profile.adminPortalDesc")}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/15" />
        </Link>
      )}

      {/* Recent activity (customer orders) */}
      <RecentActivity />


      {/* Cart summary */}
      {cart.length > 0 && (
        <Link to="/cart" className="bento-card flex items-center justify-between p-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <Package className="w-[18px] h-[18px] text-cyan" strokeWidth={1.8} />
            <div>
              <span className="text-[14px] font-bold text-foreground block tracking-tight">
                {cart.length} {cart.length > 1 ? t("profile.itemsInCart") : t("profile.itemInCart")}
              </span>
              <span className="text-[11px] text-muted-foreground/40">{t("cart.total")}: ${cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/15" />
        </Link>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.title}>
          <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] mb-2 px-1">{section.title}</p>
          <div className="bento-card divide-y divide-border/20 overflow-hidden">
            {section.items.map((item) => {
              const inner = (
                <div className="flex items-center justify-between p-3.5 hover:bg-secondary/20 transition-colors active:bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-[17px] h-[17px] text-muted-foreground/35" strokeWidth={1.8} />
                    <div>
                      <span className="text-[14px] font-medium text-foreground block tracking-tight">{item.label}</span>
                      {"desc" in item && item.desc && <span className="text-[10px] text-muted-foreground/35">{item.desc}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/12" />
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
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-destructive/60 hover:bg-destructive/5 transition-colors active:scale-[0.98]"
      >
        <LogOut className="w-[17px] h-[17px]" strokeWidth={1.8} />
        <span className="text-[14px] font-semibold">{t("profile.signOut")}</span>
      </button>
    </div>
  );
}
