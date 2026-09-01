import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AccountSettings() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      navigate("/profile");
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      const errMsg = (data as { error?: string } | null)?.error;
      if (error || errMsg) {
        toast.error(errMsg || error?.message || "Could not delete your account. Please try again.");
        setDeleting(false);
        return;
      }
      localStorage.removeItem("saved_products");
      await signOut();
      setDeleteOpen(false);
      toast.success("Your account has been deleted");
      navigate("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete your account.");
    } finally {
      setDeleting(false);
    }
  };


  return (
    <div className="px-5 py-5 space-y-5 md:max-w-md md:mx-auto md:px-8 md:py-8 animate-fade-in">
      <Link to="/profile" className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-page-title text-foreground">Account Settings</h1>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Email</label>
          <input value={profile?.email || ""} disabled className="input-field mt-1 opacity-60" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+856 20 xxx xxxx" className="input-field mt-1" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Default address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="input-field mt-1 resize-none" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "Saving..." : "Save changes"}
      </button>

      {/* Danger zone */}
      <section className="pt-4 border-t border-border/40 space-y-3">
        <div>
          <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-[0.15em]">Danger zone</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1.5 leading-relaxed">
            Deleting your account permanently removes your profile, phone number, address, saved items,
            notifications and chat history. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => { setConfirmText(""); setDeleteOpen(true); }}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-[1.5px] border-destructive/30 text-destructive text-[14px] font-semibold hover:bg-destructive/5 transition-colors active:scale-[0.98]"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.8} /> Delete Account
        </button>
      </section>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left">
                <p>
                  This permanently deletes your account and personal data: profile details (name, phone,
                  address), saved items, notifications, chat conversations and any admin access.
                </p>
                <p>
                  Completed orders are kept for accounting and legal reasons, but they are anonymized —
                  your name, email and phone number are removed from them.
                </p>
                <p className="font-medium text-foreground">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Type DELETE to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoCapitalize="characters"
              className="input-field mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText.trim().toUpperCase() !== "DELETE" || deleting}
              onClick={(e) => { e.preventDefault(); deleteAccount(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete my account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

}
