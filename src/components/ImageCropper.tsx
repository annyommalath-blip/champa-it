import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { RotateCw } from "lucide-react";

interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number;
}

function createCroppedImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context failed")); return; }

      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      }, "image/jpeg", 0.92);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export default function ImageCropper({ open, imageSrc, onClose, onCropComplete, aspectRatio = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((z: number) => {
    setZoom(z);
  }, []);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await createCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch {
      console.error("Crop failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base">Crop Image</DialogTitle>
        </DialogHeader>

        <div className="relative w-full" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={handleCropComplete}
            showGrid={false}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: "2px solid hsl(var(--primary))", borderRadius: 12 },
            }}
          />
        </div>

        <div className="px-5 pb-1 pt-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground w-10">Zoom</span>
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Reset">
              <RotateCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">Drag to reposition · Pinch or slide to zoom</p>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={saving}>
            {saving ? "Cropping..." : "Apply Crop"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
