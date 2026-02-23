import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Ban } from "lucide-react";

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

export default function AdminManagement() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const fetchData = async () => {
    const { data: reqs } = await supabase.from("admin_requests").select("*").order("created_at", { ascending: false });
    setRequests((reqs as AdminRequest[]) || []);

    const { data: profs } = await supabase.from("profiles").select("user_id, full_name, email, status");
    const map: Record<string, Profile> = {};
    (profs || []).forEach((p: any) => { map[p.user_id] = p; });
    setProfiles(map);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (req: AdminRequest, action: "approve" | "reject" | "disable") => {
    if (!user) return;

    if (action === "approve") {
      // Update role to approved_admin
      await supabase.from("user_roles").update({ role: "approved_admin" }).eq("user_id", req.user_id);
      await supabase.from("admin_requests").update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);
      // Audit log
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <p className="text-sm text-muted-foreground">Approve or reject admin access requests</p>
      </div>

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
          <p className="text-center text-muted-foreground py-8">No admin requests.</p>
        )}
      </div>
    </div>
  );
}
