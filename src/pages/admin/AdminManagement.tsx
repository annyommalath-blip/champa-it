import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, XCircle, Ban, Mail, Trash2, Copy, Send } from "lucide-react";

interface AdminRequest {
  id: string;
  user_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string;
  status: string;
}

interface Invite {
  id: string;
  email: string;
  used_at: string | null;
  created_at: string;
}

export default function AdminManagement() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  const fetchData = async () => {
    const { data: reqs } = await supabase.from("admin_requests").select("*").order("created_at", { ascending: false });
    setRequests((reqs as AdminRequest[]) || []);

    const { data: profs } = await supabase.from("profiles").select("user_id, full_name, email, status");
    const map: Record<string, Profile> = {};
    (profs || []).forEach((p: any) => { map[p.user_id] = p; });
    setProfiles(map);

    const { data: invs } = await supabase.from("admin_invites").select("id, email, used_at, created_at").order("created_at", { ascending: false });
    setInvites((invs as Invite[]) || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setInviting(true);
    const { data: inserted, error } = await supabase
      .from("admin_invites")
      .insert({ email, invited_by: user?.id })
      .select("id")
      .single();
    if (error) { setInviting(false); toast.error(error.message); return; }

    const { error: mailError } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-invite",
        recipientEmail: email,
        idempotencyKey: `admin-invite-${inserted?.id}`,
        templateData: {
          inviteEmail: email,
          signupUrl: `${window.location.origin}/auth`,
          invitedBy: "Champa Enterprise",
        },
      },
    });
    setInviting(false);

    if (mailError) {
      toast.warning(`Invite saved for ${email}, but the email could not be sent. Share the sign-up link manually.`);
    } else {
      toast.success(`Invitation email sent to ${email}. They must sign up with this email; you'll still approve their request.`);
    }
    setInviteEmail("");
    fetchData();

  };

  const resendInvite = async (inv: Invite) => {
    setResending(inv.id);
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-invite",
        recipientEmail: inv.email,
        idempotencyKey: `admin-invite-${inv.id}-${Date.now()}`,
        templateData: {
          inviteEmail: inv.email,
          signupUrl: `${window.location.origin}/auth`,
          invitedBy: "Champa Enterprise",
        },
      },
    });
    setResending(null);
    if (error) toast.error("Could not resend the invitation email.");
    else toast.success(`Invitation resent to ${inv.email}`);
  };

  const revokeInvite = async (id: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Invite revoked"); fetchData(); }
  };


  const handleAction = async (req: AdminRequest, action: "approve" | "reject" | "disable") => {
    if (!user) return;

    if (action === "approve") {
      await supabase.from("user_roles").update({ role: "approved_admin" }).eq("user_id", req.user_id);
      await supabase.from("admin_requests").update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);
      await supabase.from("audit_logs").insert({ actor_id: user.id, action: "approve_admin", target_user_id: req.user_id, details: { request_id: req.id } });
      toast.success("Admin approved");
    } else if (action === "reject") {
      await supabase.from("user_roles").update({ role: "customer" }).eq("user_id", req.user_id);
      await supabase.from("admin_requests").update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);
      await supabase.from("audit_logs").insert({ actor_id: user.id, action: "reject_admin", target_user_id: req.user_id, details: { request_id: req.id } });
      toast.success("Admin rejected");
    } else {
      await supabase.from("user_roles").update({ role: "customer" }).eq("user_id", req.user_id);
      await supabase.from("admin_requests").update({ status: "disabled", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);
      await supabase.from("profiles").update({ status: "disabled" }).eq("user_id", req.user_id);
      await supabase.from("audit_logs").insert({ actor_id: user.id, action: "disable_admin", target_user_id: req.user_id, details: { request_id: req.id } });
      toast.success("Admin disabled");
    }
    fetchData();
  };

  const signupUrl = `${window.location.origin}/auth`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <p className="text-sm text-muted-foreground">Invite admins and approve access requests</p>
      </div>

      {/* Invite */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" /> Invite new admin</CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter the invitee's email. They must sign up at your site using that exact email — their request will then appear below for your final approval.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
            <Button onClick={handleInvite} disabled={inviting} className="gap-1.5 shrink-0">
              <Mail className="w-3.5 h-3.5" /> {inviting ? "Inviting..." : "Invite"}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Share the sign-up link:</span>
            <code className="px-2 py-1 rounded bg-secondary flex-1 truncate">{signupUrl}</code>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(signupUrl); toast.success("Copied"); }}
              className="p-1.5 rounded hover:bg-secondary"
              aria-label="Copy sign-up link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {invites.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Pending invites</p>
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {inv.used_at ? `Signed up ${new Date(inv.used_at).toLocaleDateString()}` : `Invited ${new Date(inv.created_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      inv.used_at ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {inv.used_at ? "Signed up" : "Awaiting sign-up"}
                    </span>
                    {!inv.used_at && (
                      <>
                        <button
                          onClick={() => resendInvite(inv)}
                          disabled={resending === inv.id}
                          className="p-1.5 rounded hover:bg-secondary text-foreground disabled:opacity-50 transition-colors"
                          aria-label="Resend invitation email"
                          title="Resend invitation email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => revokeInvite(inv.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          aria-label="Revoke invite"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Access requests</h2>
        <div className="space-y-4">
          {requests.map((req) => {
            const prof = profiles[req.user_id];
            return (
              <Card key={req.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{prof?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{prof?.email || req.user_id}</p>
                      {req.reason && <p className="text-xs text-muted-foreground mt-1 italic">"{req.reason}"</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(req.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === "pending" ? (
                        <>
                          <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-300 hover:bg-green-50" onClick={() => handleAction(req, "approve")}>
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleAction(req, "reject")}>
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          req.status === "approved" ? "bg-green-100 text-green-700" :
                          req.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {req.status}
                        </span>
                      )}
                      {req.status === "approved" && (
                        <Button size="sm" variant="outline" className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50" onClick={() => handleAction(req, "disable")}>
                          <Ban className="w-3.5 h-3.5" /> Disable
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {requests.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No admin requests.</p>
          )}
        </div>
      </div>
    </div>
  );
}
