import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TestimonialPhotoUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function TestimonialPhotoUpload({
  currentUrl,
  onUpload,
  onRemove,
}: TestimonialPhotoUploadProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t({ pt: "Formato não suportado", en: "Unsupported format" }));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t({ pt: "Imagem muito grande (máx 2MB)", en: "Image too large (max 2MB)" }));
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("testimonial-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("testimonial-photos")
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
      toast.success(t({ pt: "Foto carregada", en: "Photo uploaded" }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t({ pt: "Erro ao carregar foto", en: "Failed to upload photo" }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">
        {t({ pt: "Foto (opcional)", en: "Photo (optional)" })}
      </label>

      {currentUrl ? (
        <div className="relative w-20 h-20 rounded-full overflow-hidden group">
          <img
            src={currentUrl}
            alt="Testimonial"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-white/20 cursor-pointer hover:border-white/40 transition-colors",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white/40 animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-white/40" />
          )}
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}

      <p className="text-xs text-white/40">
        {t({ pt: "JPG, PNG ou WebP. Máx 2MB.", en: "JPG, PNG or WebP. Max 2MB." })}
      </p>
    </div>
  );
}
