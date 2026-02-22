import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkPlus, Check, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface SaveMealPromptProps {
  onSave: () => Promise<boolean | void> | void;
  onDismiss: () => void;
  mealName: string;
  calories: number | null;
  /** Whether the meal was already saved */
  alreadySaved?: boolean;
}

/**
 * A subtle, non-intrusive prompt that appears below the result card
 * encouraging users to save their meal to history.
 */
export function SaveMealPrompt({
  onSave,
  onDismiss,
  mealName,
  calories,
  alreadySaved = false,
}: SaveMealPromptProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(alreadySaved);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (dismissed || saved) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
    } catch (err) {
      console.error("[SaveMealPrompt] Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">

            <BookmarkPlus className="h-5 w-5 text-primary flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {mealName}
              </p>
              {calories !== null && (
                <p className="text-xs text-muted-foreground">
                  {calories} kcal · {t({ pt: "Guardar no histórico?", en: "Save to history?" })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {saved ? (
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <Check className="h-3.5 w-3.5" />
                  {t({ pt: "Guardado", en: "Saved" })}
                </span>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-50">
                    {saving
                      ? t({ pt: "A guardar...", en: "Saving..." })
                      : t({ pt: "Guardar", en: "Save" })}
                  </button>
                  <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
