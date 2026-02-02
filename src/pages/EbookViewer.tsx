import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, ExternalLink, Loader2, FileText, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAcademyItems, AcademyItem } from "@/hooks/useAcademyItems";
import { useHasPurchased } from "@/hooks/useUserPurchases";
import { Skeleton } from "@/components/ui/skeleton";

export default function EbookViewer() {
  const { ebookId } = useParams<{ ebookId: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Fetch ebook details
  const { data: allEbooks, isLoading: isLoadingEbooks } = useAcademyItems("ebook");
  
  const ebook = allEbooks?.find((item) => item.id === ebookId) as (AcademyItem & { download_url?: string }) | undefined;
  
  // Check purchase status
  const { hasPurchased, isLoading: isLoadingPurchase } = useHasPurchased(ebookId || "");

  const isLoading = isLoadingEbooks || isLoadingPurchase;

  const title = ebook ? (language === "pt" ? ebook.title_pt : ebook.title_en) : "";

  // Handle download with fetch to avoid browser issues
  const handleDownload = async () => {
    if (!ebook?.download_url) return;
    
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Fetch the PDF as a blob
      const response = await fetch(ebook.download_url);
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "ebook"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(
        t({
          pt: "Erro ao descarregar. Tenta abrir no browser.",
          en: "Download failed. Try opening in browser.",
        })
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Open in new tab as fallback
  const handleOpenInBrowser = () => {
    if (ebook?.download_url) {
      window.open(ebook.download_url, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 rounded-2xl mb-4" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">
            {t({ pt: "Ebook não encontrado", en: "Ebook not found" })}
          </p>
          <button
            onClick={() => navigate("/learn")}
            className="px-4 py-2 rounded-xl bg-white text-[hsl(340_45%_45%)] font-medium"
          >
            {t({ pt: "Voltar à Academia", en: "Back to Academy" })}
          </button>
        </div>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="p-4 rounded-full bg-orange-500/20 w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {t({ pt: "Acesso Restrito", en: "Access Restricted" })}
          </h2>
          <p className="text-white/60 mb-4 text-sm">
            {t({
              pt: "Precisas de comprar este ebook para aceder.",
              en: "You need to purchase this ebook to access it.",
            })}
          </p>
          <button
            onClick={() => navigate(`/learn/ebook/${ebookId}`)}
            className="px-6 py-3 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold"
          >
            {t({ pt: "Ver Detalhes", en: "View Details" })}
          </button>
        </div>
      </div>
    );
  }

  if (!ebook.download_url) {
    return (
      <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="p-4 rounded-full bg-orange-500/20 w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            {t({ pt: "Ficheiro Indisponível", en: "File Unavailable" })}
          </h2>
          <p className="text-white/60 mb-4 text-sm">
            {t({
              pt: "O ficheiro ainda não está disponível. Contacta o suporte.",
              en: "The file is not yet available. Please contact support.",
            })}
          </p>
          <button
            onClick={() => navigate("/support")}
            className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium"
          >
            {t({ pt: "Contactar Suporte", en: "Contact Support" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="font-semibold text-white truncate flex-1">{title}</h1>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-8"
      >
        {/* Ebook Card */}
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 p-8 text-center">
            {/* Cover */}
            <div className="mb-6">
              {ebook.cover_image_url ? (
                <img
                  src={ebook.cover_image_url}
                  alt={title}
                  className="w-40 h-56 mx-auto rounded-xl shadow-2xl object-cover"
                />
              ) : (
                <div className="w-40 h-56 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <span className="text-6xl">{ebook.cover_emoji || "📚"}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            
            {ebook.subtitle_pt && (
              <p className="text-sm text-white/70 mb-6">
                {language === "pt" ? ebook.subtitle_pt : ebook.subtitle_en}
              </p>
            )}

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(155_40%_45%)]/20 text-[hsl(155_40%_55%)] mb-6">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t({ pt: "Compra confirmada", en: "Purchase confirmed" })}
              </span>
            </div>

            {/* Error message */}
            {downloadError && (
              <div className="mb-4 p-3 rounded-xl bg-orange-500/20 text-orange-300 text-sm">
                {downloadError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-[hsl(340_45%_45%)] font-semibold shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t({ pt: "A descarregar...", en: "Downloading..." })}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>{t({ pt: "Descarregar PDF", en: "Download PDF" })}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenInBrowser}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t({ pt: "Abrir no browser", en: "Open in browser" })}</span>
              </button>
            </div>

            {/* Help text */}
            <p className="mt-6 text-xs text-white/50">
              {t({
                pt: "Se o download não funcionar, usa 'Abrir no browser' e guarda o ficheiro manualmente.",
                en: "If download doesn't work, use 'Open in browser' and save the file manually.",
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
