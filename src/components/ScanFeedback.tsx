import { useState } from "react";
import { ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScanFeedbackProps {
  scanId: string;
  detectedMake: string | null;
  detectedModel: string | null;
  detectedYear: string | null;
  detectedVehicleType: string;
  confidenceScore: number | null;
  spotScore: number | null;
}

type FeedbackType = "correct" | "wrong_make" | "wrong_model" | "wrong_vehicle_type" | "other";

export function ScanFeedback({
  scanId,
  detectedMake,
  detectedModel,
  detectedYear,
  detectedVehicleType,
  confidenceScore,
  spotScore,
}: ScanFeedbackProps) {
  const [state, setState] = useState<"idle" | "input" | "done">("idle");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const extractCorrections = (input: string) => {
    if (!input || input.trim().length < 3) return { make: null, model: null };
    const cleaned = input.replace(/^(it'?s\s+a\s+|i\s+think\s+it'?s\s+a?\s*)/i, '').trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 1);
    if (words.length >= 2) return { make: words[0], model: words.slice(1).join(' ') };
    if (words.length === 1) return { make: words[0], model: null };
    return { make: null, model: null };
  };

  const submit = async (type: FeedbackType, suggestion?: string) => {
    (document.activeElement as HTMLElement)?.blur();
    setSending(true);
    
    const corrections = extractCorrections(suggestion || '');
    
    try {
      const { error } = await supabase.from("scan_feedback").insert({
        scan_id: scanId,
        detected_make: detectedMake,
        detected_model: detectedModel,
        detected_year: detectedYear,
        detected_vehicle_type: detectedVehicleType,
        confidence_score: confidenceScore,
        spot_score: spotScore,
        feedback_type: type,
        user_suggestion: suggestion || null,
        user_correct_make: type !== "correct" ? corrections.make : null,
        user_correct_model: type !== "correct" ? corrections.model : null,
        reviewed: false,
      });

      if (error) throw error;
      setState("done");
      toast.success("Thanks!");
    } catch (err) {
      console.error("[Feedback]", err);
      toast.error("Couldn't save");
    } finally {
      setSending(false);
    }
  };

  if (state === "done") {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-primary">✓ Noted</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state === "idle" && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => submit("correct")}
            disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            Correct
          </button>
          <button
            onClick={() => setState("input")}
            disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="h-4 w-4" />
            Wrong
          </button>
        </div>
      )}

      {state === "input" && (
        <div className="flex gap-2 animate-fade-in">
          <input
            type="text"
            placeholder="What is it?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-secondary text-sm border border-border focus:border-primary focus:outline-none"
            maxLength={100}
            autoFocus
          />
          <button
            type="button"
            onClick={() => submit("wrong_model", text.trim() || undefined)}
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
