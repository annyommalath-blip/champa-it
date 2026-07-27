import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpg";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");

  useEffect(() => {
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && !cancelled)) {
        setStatus("ready");
      }
    });

    const verify = async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const errorDesc = url.searchParams.get("error_description") || hash.get("error_description");
      if (errorDesc) {
        if (!cancelled) setStatus("invalid");
        return;
      }

      // 1) Implicit flow: #access_token=...&type=recovery
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      // 2) PKCE flow: ?code=...
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      // 3) Token hash flow: ?token_hash=...&type=recovery
      const tokenHash = url.searchParams.get("token_hash") || hash.get("token_hash");
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (!cancelled) setStatus(error ? "invalid" : "ready");
        window.history.replaceState({}, "", window.location.pathname);
        return;
      }

      // 4) Already-established recovery session
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setStatus(data.session ? "ready" : "invalid");
    };

    verify();
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Password updated successfully!");
      navigate("/");
    }
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button onClick={() => navigate("/auth")} variant="outline">Back to Sign In</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src={logo} alt="Champa" className="h-16 w-16 rounded-2xl object-cover mx-auto mb-4 ring-2 ring-primary/20" />
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input id="newPassword" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
