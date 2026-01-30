import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductImageUploadProps {
  currentImageUrl: string | null;
  currentEmoji: string | null;
  onImageChange: (url: string | null) => void;
  onEmojiChange: (emoji: string) => void;
}

const EMOJI_OPTIONS = ["📦", "🥛", "💪", "⚖️", "🍶", "🌾", "🥗", "🍎", "🏋️", "🎯"];

export function ProductImageUpload({
  currentImageUrl,
  currentEmoji,
  onImageChange,
  onEmojiChange,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecione uma imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 5MB)");
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      onImageChange(urlData.publicUrl);
      toast.success("Imagem carregada!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
      // Reset input
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
      <label className="text-xs text-white/60 block">Imagem do Produto</label>
      
      {/* Current image preview or upload area */}
      <div className="flex gap-3">
        {/* Image preview / upload button */}
        <div className="relative">
          {currentImageUrl ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/10">
              <img
                src={currentImageUrl}
                alt="Product"
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
              className="w-20 h-20 rounded-xl bg-white/10 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-white/60 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-white/60" />
                  <span className="text-[10px] text-white/40">Upload</span>
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
            Ou escolha um emoji (usado se não houver imagem):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onEmojiChange(emoji)}
                className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
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
    </div>
  );
}
