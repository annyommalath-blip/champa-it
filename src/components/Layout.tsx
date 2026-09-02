import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Wrench, User, MessageCircle, ShoppingCart, Bell, Headphones, HelpCircle, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
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
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadNotif(0); return; }
    let cancelled = false;
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
        .neq("type", "chat_message");
      if (!cancelled) setUnreadNotif(count ?? 0);
    };
    load();
    const channel = supabase
      .channel(`notif-badge-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user]);

  // Unread chat (admin replies) badge on FAB
  useEffect(() => {
    if (!user) { setUnreadChat(0); return; }
    const lastSeenKey = `chat_last_seen_${user.id}`;
    const getLastSeen = () => localStorage.getItem(lastSeenKey) || "1970-01-01T00:00:00Z";
    let cancelled = false;
    let convIds: string[] = [];

    const recount = async () => {
      if (convIds.length === 0) { if (!cancelled) setUnreadChat(0); return; }
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .eq("sender_type", "admin")
        .gt("created_at", getLastSeen());
      if (!cancelled) setUnreadChat(count ?? 0);
    };

    const setup = async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active");
      convIds = (data || []).map((c: any) => c.id);
      await recount();
    };
    setup();

    const channel = supabase
      .channel(`chat-unread-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload: any) => {
        const m = payload.new;
        if (m?.sender_type === "admin" && convIds.includes(m.conversation_id)) {
          // If widget is open, mark seen immediately so no unread accrues
          if (chatOpenRef.current) {
            localStorage.setItem(lastSeenKey, new Date().toISOString());
            setUnreadChat(0);
          } else {
            recount();
          }
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_conversations", filter: `user_id=eq.${user.id}` }, (payload: any) => {
        if (payload.new?.id) convIds.push(payload.new.id);
      })
      .subscribe();

    const onStorage = (e: StorageEvent) => { if (e.key === lastSeenKey) recount(); };
    window.addEventListener("storage", onStorage);
    return () => { cancelled = true; supabase.removeChannel(channel); window.removeEventListener("storage", onStorage); };
  }, [user]);

  // Track chatOpen in ref for realtime handler
  const chatOpenRef = useRef(false);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);

  // Mark chat seen when widget opens
  useEffect(() => {
    if (chatOpen && user) {
      const key = `chat_last_seen_${user.id}`;
      localStorage.setItem(key, new Date().toISOString());
      setUnreadChat(0);
    }
  }, [chatOpen, user]);



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

      {/* Mobile top bar — yellow branded on home */}
      {location.pathname === "/" ? (
        <header className="md:hidden sticky top-0 z-50 bg-primary safe-area-top">
          <div className="px-5 pt-2 pb-3 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Champa Enterprise" className="h-9 w-auto object-contain" />
            </Link>
            <div className="flex items-center gap-1">
              <Link to="/profile/faq" aria-label="Help" className="p-2 rounded-full active:scale-90 transition-transform">
                <HelpCircle className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={2} />
              </Link>
              <Link to="/notifications" aria-label="Notifications" className="relative p-2 rounded-full active:scale-90 transition-transform">
                <Bell className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={2} />
                {unreadNotif > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold px-1 ring-2 ring-primary">
                    {unreadNotif > 9 ? "9+" : unreadNotif}
                  </span>
                )}
              </Link>
              <Link to="/cart" aria-label="Cart" className="relative p-2 rounded-full active:scale-90 transition-transform">
                <ShoppingCart className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold px-1 ring-2 ring-primary">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="px-5 pb-3">
            <Link to="/shop" className="flex items-center gap-3 px-4 h-11 rounded-full bg-background shadow-sm active:scale-[0.99] transition-transform">
              <Search className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[14px] text-muted-foreground/70">Search Champa</span>
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto scrollbar-hide px-5 pb-3 text-[13px] font-semibold text-primary-foreground">
            <Link to="/shop" className="flex-shrink-0">Shop</Link>
            <Link to="/services" className="flex-shrink-0">Services</Link>
            <Link to="/shop" className="flex-shrink-0">Deals</Link>
            <Link to="/contact" className="flex-shrink-0">Get Quote</Link>
            <Link to="/profile/orders" className="flex-shrink-0">Track Order</Link>
          </div>
        </header>
      ) : (
        <header className="md:hidden px-5 min-h-[56px] safe-area-top pb-2 glass-header sticky top-0 z-50 border-b border-border/30 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Champa" className="h-7 w-auto object-contain" />
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
            <Link to="/notifications" className="relative p-2 rounded-xl active:scale-90 transition-transform">
              <Bell className="w-[18px] h-[18px] text-foreground/50" strokeWidth={1.8} />
              {unreadNotif > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold px-0.5">
                  {unreadNotif > 9 ? "9+" : unreadNotif}
                </span>
              )}
            </Link>
          </div>
        </header>
      )}

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
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-[48px] transition-all active:scale-90"
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
        <button
          onClick={() => setChatOpen(true)}
          aria-label={t("nav.chat")}
          className="fixed right-4 bottom-[84px] md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-background hover:scale-105"
        >
          <Headphones className="w-6 h-6" strokeWidth={2} />
          {unreadChat > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center ring-2 ring-background animate-scale-in">
              {unreadChat > 9 ? "9+" : unreadChat}
            </span>
          )}
        </button>
      )}

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />




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
