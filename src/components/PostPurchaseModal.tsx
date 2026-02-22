import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, X, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { openWhatsApp, WHATSAPP_MESSAGES } from "@/lib/constants";

/**
 * PostPurchaseModal
 *
 * Detects ?purchase=success in the URL (set by your Stripe success_url),
 * shows a celebration + upsell, then cleans up the URL.
 *
 * In your Stripe checkout creation (create-checkout edge function),
 * set success_url to:  https://saralucas.pt/learn?purchase=success
 */
export function PostPurchaseModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (searchParams.get("purchase") === "success") {
      setOpen(true);
      // Clean up the URL without triggering a navigation
      const next = new URLSearchParams(searchParams);
      next.delete("purchase");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleClose = () => setOpen(false);

  const handleUpsell = () => {
    setOpen(false);
    navigate("/learn?type=store");
  };

  const handleConsultation = () => {
    setOpen(false);
    openWhatsApp(WHATSAPP_MESSAGES.workWithMe, language);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-md"
          >
            <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">

              {/* Success header */}
              <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-primary/15 to-transparent">
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>

                <h2 className="text-xl font-display font-semibold text-foreground">
                  {t({ pt: "Compra confirmada!", en: "Purchase confirmed!" })}
                </h2>

                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  {t({
                    pt: "O teu acesso foi ativado. Vai a Academia para começar.",
                    en: "Your access has been activated. Head to Academy to start.",
                  })}
                </p>
              </div>

              {/* Upsell body */}
              <div className="px-6 pb-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-5">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t({
                        pt: "Quer resultados ainda mais rápidos?",
                        en: "Want even faster results?",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t({
                        pt: "Complementa o teu produto com acompanhamento personalizado. Consulta inicial gratuita.",
                        en: "Complement your product with personalized coaching. Free initial consultation.",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={handleConsultation} className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-terracotta-dark transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {t({ pt: "Marcar Consulta Gratuita", en: "Book Free Consultation" })}
                  </button>

                  <button onClick={handleUpsell} className="w-full py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    {t({ pt: "Ver Mais Produtos", en: "Browse More Products" })}
                  </button>

                  <button onClick={handleClose} className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t({ pt: "Ir para a Academia →", en: "Go to Academy →" })}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
