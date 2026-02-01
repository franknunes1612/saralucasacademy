import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface EbookFileUploadProps {
  currentFileUrl: string | null;
  onFileChange: (url: string | null) => void;
}

export function EbookFileUpload({
  currentFileUrl,
  onFileChange,
}: EbookFileUploadProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error(t({ pt: "Por favor selecione um ficheiro PDF", en: "Please select a PDF file" }));
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error(t({ pt: "Ficheiro muito grande (máx. 50MB)", en: "File too large (max 50MB)" }));
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileName = `ebook-${crypto.randomUUID()}.pdf`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("ebook-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("ebook-files")
        .getPublicUrl(fileName);

      onFileChange(urlData.publicUrl);
      toast.success(t({ pt: "PDF carregado com sucesso!", en: "PDF uploaded successfully!" }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t({ pt: "Erro ao carregar PDF", en: "Error uploading PDF" }));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
  };

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/");
      return parts[parts.length - 1] || "ebook.pdf";
    } catch {
      return "ebook.pdf";
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-white/70 block">
        {t({ pt: "Ficheiro PDF do Ebook", en: "Ebook PDF File" })}
      </label>
      
      {currentFileUrl ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {getFileName(currentFileUrl)}
            </p>
            <a
              href={currentFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              {t({ pt: "Abrir PDF", en: "Open PDF" })}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-2 rounded-lg hover:bg-destructive/20 text-destructive/60 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full p-4 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/10 hover:border-white/30 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 text-white/60 animate-spin" />
              <span className="text-sm text-white/60">
                {t({ pt: "A carregar...", en: "Uploading..." })}
              </span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-white/60" />
              <span className="text-sm text-white/60">
                {t({ pt: "Clica para carregar PDF", en: "Click to upload PDF" })}
              </span>
              <span className="text-xs text-white/40">
                {t({ pt: "Máximo 50MB", en: "Maximum 50MB" })}
              </span>
            </>
          )}
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input as alternative */}
      <div>
        <p className="text-xs text-white/50 mb-1">
          {t({ pt: "Ou cole um URL externo:", en: "Or paste an external URL:" })}
        </p>
        <input
          type="text"
          value={currentFileUrl || ""}
          onChange={(e) => onFileChange(e.target.value || null)}
          placeholder="https://drive.google.com/..."
          className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>
    </div>
  );
}
