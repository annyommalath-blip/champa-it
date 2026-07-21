import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Bell,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import logo from "@/assets/logo.jpg";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/admins", label: "Admin Management", icon: Users, superOnly: true },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = adminNav.filter(
    (item) => !item.superOnly || role === "super_admin"
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (item: typeof adminNav[0]) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex bg-navy">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/10 bg-navy">
        <div className="p-5 border-b border-border/10">
          <Link to="/admin" className="flex items-center gap-3">
            <img src={logo} alt="Champa" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-sm text-gold">Champa</span>
              <span className="block text-[10px] text-muted-foreground tracking-widest uppercase">Admin Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {profile?.full_name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile?.full_name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
            >
              Customer View
              <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header + overlay */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">

        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/10 bg-navy">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-gold">Champa Admin</span>
          <div className="flex items-center gap-1">
            <Link to="/" className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Back to Store">
              <Home className="w-4 h-4" />
            </Link>
            <button onClick={handleSignOut} className="p-2 text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-background/80" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-navy border-r border-border/10 flex flex-col animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-border/10">
                <span className="font-bold text-sm text-gold">Champa Admin</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-navy-lighter p-3 sm:p-4 lg:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
