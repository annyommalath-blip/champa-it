import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/assets/logo.jpg";

export default function Auth() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReason, setAdminReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("auth.welcomeBack"));
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("auth.minPassword"));
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, isAdmin, adminReason);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("auth.checkEmail"));
      setTab("login");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("auth.resetSent"));
      setTab("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img src={logo} alt="Champa" className="h-16 w-16 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-primary/20" />
          <h1 className="text-2xl font-bold text-foreground">Champa Enterprise</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "login" ? t("auth.signInTitle") : tab === "signup" ? t("auth.signUpTitle") : t("auth.resetTitle")}
          </p>
        </div>

        {/* Tab pills */}
        {tab !== "forgot" && (
          <div className="flex bg-muted rounded-xl p-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {t("auth.signInTab")}
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {t("auth.signUpTab")}
            </button>
          </div>
        )}

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="button" onClick={() => setTab("forgot")} className="text-xs text-primary hover:underline">
              {t("auth.forgotPassword")}
            </button>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.signInBtn")}
            </Button>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.fullName")}</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupEmail">{t("auth.email")}</Label>
              <Input id="signupEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupPassword">{t("auth.password")}</Label>
              <div className="relative">
                <Input id="signupPassword" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Checkbox id="adminCheck" checked={isAdmin} onCheckedChange={(v) => setIsAdmin(v === true)} className="mt-0.5" />
              <div>
                <Label htmlFor="adminCheck" className="text-sm font-medium cursor-pointer">{t("auth.adminCheckbox")}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{t("auth.adminCheckboxDesc")}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="reason">{t("auth.adminReason")}</Label>
                <Textarea id="reason" value={adminReason} onChange={(e) => setAdminReason(e.target.value)} placeholder={t("auth.adminReasonPlaceholder")} rows={3} required />
              </div>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.signUpBtn")}
            </Button>
          </form>
        )}

        {/* Forgot password form */}
        {tab === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">{t("auth.email")}</Label>
              <Input id="resetEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.sendResetLink")}
            </Button>
            <button type="button" onClick={() => setTab("login")} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
              {t("auth.backToSignIn")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
