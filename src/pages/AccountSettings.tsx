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
    </div>
  );
}
