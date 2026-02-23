import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  long_description: string;
  price: number;
  category: string;
  images: string[];
  in_stock: boolean;
  rating: number;
  specs: Record<string, string>;
}

const emptyProduct: ProductFormData = {
  name: "", description: "", long_description: "", price: 0, category: "Uncategorized",
  images: [], in_stock: true, rating: 0, specs: {},
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductFormData | null;
  onSaved?: () => void;
}

export default function InlineProductEditor({ open, onOpenChange, product, onSaved }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<ProductFormData>(product || emptyProduct);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Sync when product changes
  useState(() => {
    setForm(product || emptyProduct);
  });

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl("");
    }
  };

  const removeImage = (i: number) => {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description,
      long_description: form.long_description,
      price: form.price,
      category: form.category,
      images: form.images.length ? form.images : ["/placeholder.svg"],
      in_stock: form.in_stock,
      rating: form.rating,
      specs: form.specs,
      created_by: user?.id,
    };

    if (form.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", form.id);
      if (error) toast.error(error.message); else toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error(error.message); else toast.success("Product created");
    }
    setLoading(false);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Product" : "Create New Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={2}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Long Description</label>
            <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3}
              value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Price ($)</label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} className="rounded" />
            <label className="text-sm">In Stock</label>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Images (URLs)</label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <Button type="button" variant="outline" onClick={addImage} size="sm">Add</Button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving..." : form.id ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
