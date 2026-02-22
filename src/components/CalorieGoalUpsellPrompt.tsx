import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { openWhatsApp, WHATSAPP_MESSAGES, STORAGE_KEYS } from "@/lib/constants";

interface CalorieGoalUpsellPromptProps {
  /** Number of scans done this session — show prompt after 3rd scan */
  scanCount: number;
  currentCalories: number;
  goal: number;
}

/**
 * Shows a contextual upsell after the user has scanned 3+ meals.
 * Only shown once per session. Redirects to /learn?type=store for paid plan
 * or opens WhatsApp for a consultation.
 */
export function CalorieGoalUpsellPrompt({
  scanCount,
  currentCalories,
  goal,
}: CalorieGoalUpsellPromptProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (dismissed) return;
    if (scanCount < 3) return;

    // Only show once per session
    const shown = sessionStorage.getItem(STORAGE_KEYS.calorieGoalPromptShown);
    if (shown) return;

    // Show after a short delay so it doesn't interrupt the result view
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEYS.calorieGoalPromptShown, "true");
    }, 1800);

    return () => clearTimeout(timer);
  }, [scanCount, dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleGetPlan = () => {
    setVisible(false);
    navigate("/learn?type=store");
  };

  const handleWhatsApp = () => {
    setVisible(false);
    openWhatsApp(WHATSAPP_MESSAGES.calorieGoalUpsell, language);
  };

  const percentage = Math.round((currentCalories / goal) * 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 overflow-hidden">
            <div className="p-4">

              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t({ pt: "Estás a fazer bem!", en: "You're doing great!" })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {percentage}% {t({ pt: "do objetivo diário", en: "of daily goal" })}
                    </p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted mb-3">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
              </div>

              {/* Upsell message */}
              <p className="text-xs text-muted-foreground mb-3">
                {t({
                  pt: "Já registaste 3 refeições. Quer um plano alimentar feito à tua medida para atingir os teus objetivos?",
                  en: "You've logged 3 meals. Want a personalized meal plan tailored to your goals?",
                })}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={handleGetPlan} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-terracotta-dark transition-colors">
                  {t({ pt: "Ver Planos", en: "View Plans" })}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleWhatsApp} className="flex-1 py-2.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  {t({ pt: "Falar Comigo", en: "Talk to Me" })}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
