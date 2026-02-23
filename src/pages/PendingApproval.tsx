import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import logo from "@/assets/logo.jpg";

export default function PendingApproval() {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <img src={logo} alt="Champa" className="h-16 w-16 rounded-2xl object-cover mx-auto ring-2 ring-primary/20" />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Awaiting Approval</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Hi {profile?.full_name || "there"}, your admin access request has been submitted.
            The Super Admin will review and approve your request. You'll receive an email once approved.
          </p>
        </div>
        <div className="app-card p-4">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium text-foreground mt-1">{profile?.email}</p>
        </div>
        <Button onClick={signOut} variant="outline" className="gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
