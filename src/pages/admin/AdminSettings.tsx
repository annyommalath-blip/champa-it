import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const [companyName, setCompanyName] = useState("Champa Private Enterprise");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [bannerText, setBannerText] = useState("🔥 Free shipping on orders over $1,000");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("settings").select("*");
      if (data) {
        data.forEach((s: any) => {
          const val = s.value as any;
          if (s.key === "company_name") setCompanyName(val || "");
          if (s.key === "company_phone") setCompanyPhone(val || "");
          if (s.key === "company_email") setCompanyEmail(val || "");
          if (s.key === "company_address") setCompanyAddress(val || "");
          if (s.key === "banner_text") setBannerText(val || "");
        });
      }
    }
    load();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("settings").select("id").eq("key", key).single();
    if (existing) {
      await supabase.from("settings").update({ value: value as any }).eq("key", key);
    } else {
      await supabase.from("settings").insert({ key, value: value as any });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await Promise.all([
      saveSetting("company_name", companyName),
      saveSetting("company_phone", companyPhone),
      saveSetting("company_email", companyEmail),
      saveSetting("company_address", companyAddress),
      saveSetting("banner_text", bannerText),
    ]);
    toast.success("Settings saved");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage company information and banners</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Company Name</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Address</label>
            <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Banner & Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Announcement Banner Text</label>
            <Input value={bannerText} onChange={(e) => setBannerText(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="gap-2">
        <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
