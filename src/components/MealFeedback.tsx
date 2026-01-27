import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MealFeedbackProps {
  scanId: string;
  items: Array<{ name: string; portion: string; estimatedCalories: number | null }>;
  totalCalories: number | { min: number; max: number } | null;
  confidenceScore: number | null;
}

type FeedbackType = "correct" | "portion_wrong" | "food_missing" | "calories_off" | "other";

const AUTO_DISMISS_MS = 2000;

export function MealFeedback({
  scanId,
  items,
  totalCalories,
  confidenceScore,
}: MealFeedbackProps) {
  const [state, setState] = useState<"idle" | "options" | "input" | "done">("idle");
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // Reset state when scanId changes (new scan)
  useEffect(() => {
    setState("idle");
    setSelectedType(null);
    setText("");
  }, [scanId]);

  // Auto-dismiss done state after timeout
  useEffect(() => {
    if (state !== "done") return;
    
    const timer = setTimeout(() => {
      setState("idle");
      setSelectedType(null);
      setText("");
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [state]);

  const submit = async (type: FeedbackType, suggestion?: string) => {
    (document.activeElement as HTMLElement)?.blur();
    setSending(true);
    
    try {
      const { error } = await supabase.from("scan_feedback").insert({
        scan_id: scanId,
        detected_make: items.map(i => i.name).join(", "),
        detected_model: null,
        detected_year: null,
        detected_vehicle_type: "food",
        confidence_score: confidenceScore,
        spot_score: typeof totalCalories === "number" ? totalCalories : null,
        feedback_type: type,
        user_suggestion: suggestion || null,
        user_correct_make: null,
        user_correct_model: null,
        reviewed: false,
      });

      if (error) throw error;
      setState("done");
      // Toast with explicit duration to auto-dismiss
      toast.success("Thanks for the feedback!", { duration: 2000 });
    } catch (err) {
      console.error("[MealFeedback]", err);
      toast.error("Couldn't save feedback");
    } finally {
      setSending(false);
    }
  };

  if (state === "done") {
    return (
      <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
        <Check className="h-4 w-4 text-primary" />
        <p className="text-xs text-primary">Feedback received</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state === "idle" && (
        <>
          <p className="text-xs text-muted-foreground text-center">Does this look right?</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => submit("correct")}
              disabled={sending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="h-4 w-4" />
              Looks good
            </button>
            <button
              onClick={() => setState("options")}
              disabled={sending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="h-4 w-4" />
              Not quite
            </button>
          </div>
        </>
      )}

      {state === "options" && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-xs text-muted-foreground text-center">What's off?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                setSelectedType("portion_wrong");
                setState("input");
              }}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-xs transition-colors"
            >
              Portion size
            </button>
            <button
              onClick={() => {
                setSelectedType("food_missing");
                setState("input");
              }}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-xs transition-colors"
            >
              Missing food
            </button>
            <button
              onClick={() => {
                setSelectedType("calories_off");
                setState("input");
              }}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-xs transition-colors"
            >
              Calories seem off
            </button>
            <button
              onClick={() => {
                setSelectedType("other");
                setState("input");
              }}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted text-xs transition-colors"
            >
              Other
            </button>
          </div>
        </div>
      )}

      {state === "input" && (
        <div className="flex gap-2 animate-fade-in">
          <input
            type="text"
            placeholder="Tell us more (optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-secondary text-sm border border-border focus:border-primary focus:outline-none"
            maxLength={200}
            autoFocus
          />
          <button
            type="button"
            onClick={() => submit(selectedType || "other", text.trim() || undefined)}
            disabled={sending}
            className="px-4 py-2 rounded-xl btn-primary text-sm disabled:opacity-50 touch-manipulation"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
