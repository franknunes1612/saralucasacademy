import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { preprocessImage } from "@/lib/imageProcessor";
import { useLanguage } from "@/hooks/useLanguage";

interface AcademyImageUploadProps {
  currentImageUrl: string | null;
  currentEmoji: string | null;
  onImageChange: (url: string | null) => void;
  onEmojiChange: (emoji: string) => void;
  type?: "course" | "lesson";
}

const COURSE_EMOJI_OPTIONS = ["🎓", "📚", "💪", "🥗", "🏋️", "🧘", "🍎", "📖", "🎯", "✨"];
const LESSON_EMOJI_OPTIONS = ["▶️", "📹", "🎬", "📺", "🎥", "📽️", "💡", "📝", "🎤", "🔊"];

export function AcademyImageUpload({
  currentImageUrl,
  currentEmoji,
  onImageChange,
  onEmojiChange,
  type = "course",
}: AcademyImageUploadProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojiOptions = type === "course" ? COURSE_EMOJI_OPTIONS : LESSON_EMOJI_OPTIONS;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t({ pt: "Por favor selecione uma imagem", en: "Please select an image" }));
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t({ pt: "Imagem muito grande (máx. 10MB)", en: "Image too large (max 10MB)" }));
      return;
    }

    setIsUploading(true);

    try {
      // Compress image before upload
      console.log(`[AcademyImageUpload] Original size: ${(file.size / 1024).toFixed(0)}KB`);
      const compressedBase64 = await preprocessImage(file);
      
      // Convert base64 back to blob for upload
      const byteCharacters = atob(compressedBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const compressedBlob = new Blob([byteArray], { type: "image/jpeg" });
      
      console.log(`[AcademyImageUpload] Compressed size: ${(compressedBlob.size / 1024).toFixed(0)}KB`);

      // Generate unique filename
      const prefix = type === "course" ? "course" : "lesson";
      const fileName = `${prefix}-${crypto.randomUUID()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("academy-images")
        .upload(fileName, compressedBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("academy-images")
        .getPublicUrl(fileName);

      onImageChange(urlData.publicUrl);
      toast.success(t({ pt: "Imagem carregada!", en: "Image uploaded!" }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t({ pt: "Erro ao carregar imagem", en: "Error uploading image" }));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs text-white/60 block">
        {t({ pt: "Imagem de Capa", en: "Cover Image" })}
      </label>
      
      <div className="flex gap-3">
        {/* Image preview / upload button */}
        <div className="relative">
          {currentImageUrl ? (
            <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-white/10">
              <img
                src={currentImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-24 h-16 rounded-xl bg-white/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-white/60 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4 text-white/60" />
                  <span className="text-[9px] text-white/40">Upload</span>
                </>
              )}
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Emoji fallback selection */}
        <div className="flex-1">
          <p className="text-[10px] text-white/40 mb-2">
            {t({ pt: "Ou escolha um emoji:", en: "Or choose an emoji:" })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onEmojiChange(emoji)}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-colors ${
                  currentEmoji === emoji
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* URL input as alternative */}
      <div>
        <p className="text-[10px] text-white/40 mb-1">
          {t({ pt: "Ou cole um URL:", en: "Or paste a URL:" })}
        </p>
        <input
          type="text"
          value={currentImageUrl || ""}
          onChange={(e) => onImageChange(e.target.value || null)}
          placeholder="https://..."
          className="w-full px-3 py-2 text-xs rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>
    </div>
  );
}
