import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

const defaultSlides: HeroSlide[] = [
  { title: "New Arrivals", subtitle: "Latest enterprise hardware & tools", cta: "Shop Now", link: "/shop" },
  { title: "Request a Quote", subtitle: "Fast estimate from our sales team", cta: "Get Quote", link: "/contact" },
  { title: "Talk to Sales", subtitle: "Live chat with our engineers", cta: "Start Chat", link: "/contact" },
  { title: "Flash Deals", subtitle: "Up to 20% off select products", cta: "View Deals", link: "/shop" },
];

export default function AdminSettings() {
  const [companyName, setCompanyName] = useState("Champa Private Enterprise");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [bannerText, setBannerText] = useState("🔥 Free shipping on orders over $1,000");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
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
          if (s.key === "hero_slides" && Array.isArray(val)) setHeroSlides(val);
        });
      }
    }
    load();
  }, []);

  const saveSetting = async (key: string, value: any) => {
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
      saveSetting("hero_slides", heroSlides),
    ]);
    toast.success("Settings saved");
    setLoading(false);
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSlide = () => {
    setHeroSlides((prev) => [...prev, { title: "", subtitle: "", cta: "Learn More", link: "/shop" }]);
  };

  const removeSlide = (index: number) => {
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage company information, banners, and homepage content</p>
      </div>

      {/* Hero Slides */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Hero Carousel Slides</CardTitle>
          <Button size="sm" variant="outline" onClick={addSlide} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Slide
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {heroSlides.map((slide, i) => (
            <div key={i} className="relative rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-xs font-semibold">Slide {i + 1}</span>
                </div>
                {heroSlides.length > 1 && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeSlide(i)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input value={slide.title} onChange={(e) => updateSlide(i, "title", e.target.value)} placeholder="Slide title" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
                  <Input value={slide.subtitle} onChange={(e) => updateSlide(i, "subtitle", e.target.value)} placeholder="Slide subtitle" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Button Text</label>
                  <Input value={slide.cta} onChange={(e) => updateSlide(i, "cta", e.target.value)} placeholder="e.g. Shop Now" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Link</label>
                  <Input value={slide.link} onChange={(e) => updateSlide(i, "link", e.target.value)} placeholder="e.g. /shop" />
                </div>
              </div>
            </div>
          ))}
          {heroSlides.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No slides. Click "Add Slide" to create one.</p>
          )}
        </CardContent>
      </Card>

      {/* Company Info */}
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

      {/* Banner */}
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