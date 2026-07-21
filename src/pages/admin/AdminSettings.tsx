import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical, Upload, X, Image, Move } from "lucide-react";

function DraggableImageCrop({
  src,
  position,
  onPositionChange,
}: {
  src: string;
  position: string;
  onPositionChange: (pos: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);

  // Parse initial position from string like "30% 70%"
  useEffect(() => {
    if (position) {
      const match = position.match(/([\d.]+)%\s+([\d.]+)%/);
      if (match) {
        setPosX(parseFloat(match[1]));
        setPosY(parseFloat(match[2]));
      } else {
        // Handle named positions
        const map: Record<string, [number, number]> = {
          "top left": [0, 0], "top center": [50, 0], "top right": [100, 0],
          "center left": [0, 50], "center": [50, 50], "center right": [100, 50],
          "bottom left": [0, 100], "bottom center": [50, 100], "bottom right": [100, 100],
          "top": [50, 0], "bottom": [50, 100], "left": [0, 50], "right": [100, 50],
        };
        const mapped = map[position];
        if (mapped) { setPosX(mapped[0]); setPosY(mapped[1]); }
      }
    }
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    dragging.current = true;
    startX.current = clientX;
    startY.current = clientY;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((clientX - startX.current) / rect.width) * -100;
    const dy = ((clientY - startY.current) / rect.height) * -100;
    startX.current = clientX;
    startY.current = clientY;
    setPosX((prev) => Math.min(100, Math.max(0, prev + dx)));
    setPosY((prev) => Math.min(100, Math.max(0, prev + dy)));
  };

  const handleEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    onPositionChange(`${posX.toFixed(1)}% ${posY.toFixed(1)}%`);
  };

  return (
    <div className="space-y-1.5">
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden border border-border cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ height: "160px" }}
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY); }}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => { const t = e.touches[0]; handleStart(t.clientX, t.clientY); }}
        onTouchMove={(e) => { const t = e.touches[0]; handleMove(t.clientX, t.clientY); }}
        onTouchEnd={handleEnd}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Crop preview"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${posX}% ${posY}%` }}
          draggable={false}
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-background/70 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <Move className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Drag to reposition</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image?: string;
  imagePosition?: string;
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
  const [chatGreeting, setChatGreeting] = useState("Hi {name}! 👋 Welcome to Champa Support. An agent will be with you shortly.");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);


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
          if (s.key === "chat_greeting" && typeof val === "string") setChatGreeting(val);
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
      saveSetting("chat_greeting", chatGreeting),
      saveSetting("hero_slides", heroSlides),
    ]);

    toast.success("Settings saved");
    setLoading(false);
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSlide = () => {
    setHeroSlides((prev) => [...prev, { title: "", subtitle: "", cta: "Learn More", link: "/shop", image: "" }]);
  };

  const removeSlide = (index: number) => {
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingIndex(index);
    const fileName = `hero-slide-${index}-${Date.now()}.${file.name.split(".").pop()}`;
    
    const { error } = await supabase.storage
      .from("hero-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploadingIndex(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("hero-images")
      .getPublicUrl(fileName);

    setHeroSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, image: urlData.publicUrl } : s))
    );
    setUploadingIndex(null);
    toast.success("Image uploaded!");
  };

  const removeImage = (index: number) => {
    setHeroSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, image: "" } : s))
    );
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

              {/* Image Upload & Preview */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Background Image</label>
                {slide.image ? (
                  <div className="space-y-2">
                    <DraggableImageCrop
                      src={slide.image}
                      position={slide.imagePosition || "50% 50%"}
                      onPositionChange={(pos) => updateSlide(i, "imagePosition", pos)}
                    />
                    <div className="flex items-center gap-2">
                      <SlideImageUploadButton
                        index={i}
                        uploading={uploadingIndex === i}
                        onUpload={handleImageUpload}
                        label="Replace"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => removeImage(i)}
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <SlideImageUploadButton
                    index={i}
                    uploading={uploadingIndex === i}
                    onUpload={handleImageUpload}
                    isPlaceholder
                  />
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

      {/* Chat auto-greeting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chat Auto-Greeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            First message sent to customers when they start a new chat
          </label>
          <textarea
            value={chatGreeting}
            onChange={(e) => setChatGreeting(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            placeholder="Hi {name}! 👋 Welcome to Champa Support..."
          />
          <p className="text-[11px] text-muted-foreground">
            Use <code className="px-1 py-0.5 rounded bg-secondary">{"{name}"}</code> to insert the customer's name.
          </p>
        </CardContent>
      </Card>



      <Button onClick={handleSave} disabled={loading} className="gap-2">
        <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

function SlideImageUploadButton({
  index,
  uploading,
  onUpload,
  label,
  isPlaceholder,
}: {
  index: number;
  uploading: boolean;
  onUpload: (index: number, file: File) => void;
  label?: string;
  isPlaceholder?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(index, file);
    e.target.value = "";
  };

  if (isPlaceholder) {
    return (
      <>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Image className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Click to upload background image</span>
              <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP • Max 5MB</span>
            </>
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <Button
        size="sm"
        variant="secondary"
        className="gap-1.5"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        {label || "Upload"}
      </Button>
    </>
  );
}
