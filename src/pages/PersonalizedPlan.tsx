import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Target, Scale, Activity, Check } from "lucide-react";

type Goal = "lose_weight" | "maintain" | "gain_muscle" | "eat_healthier";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: "lose_weight", label: "Lose weight", icon: "📉" },
  { value: "maintain", label: "Maintain weight", icon: "⚖️" },
  { value: "gain_muscle", label: "Build muscle", icon: "💪" },
  { value: "eat_healthier", label: "Eat healthier", icon: "🥗" },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Desk job, little exercise" },
  { value: "light", label: "Lightly active", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately active", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Active", description: "Hard exercise 6-7 days/week" },
  { value: "very_active", label: "Very active", description: "Athlete or physical job" },
];

export default function PersonalizedPlan() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate plan generation
    setTimeout(() => {
      setIsGenerating(false);
      setStep(3);
    }, 2000);
  };

  const canProceed = step === 1 ? goal !== null : activityLevel !== null;

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Personalized Plan</h1>
          <p className="text-xs text-white/60">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Goal */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Target className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">What's your main goal?</h2>
            <p className="text-sm text-white/60">We'll customize your plan based on this</p>
          </div>

          <div className="space-y-3">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
                  goal === g.value
                    ? "bg-primary text-primary-foreground ring-2 ring-white/30"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <span className="font-medium">{g.label}</span>
                {goal === g.value && <Check className="h-5 w-5 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Activity Level */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Activity className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-2">How active are you?</h2>
            <p className="text-sm text-white/60">This helps us calculate your needs</p>
          </div>

          <div className="space-y-3">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setActivityLevel(level.value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  activityLevel === level.value
                    ? "bg-primary text-primary-foreground ring-2 ring-white/30"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{level.label}</p>
                    <p className={`text-xs ${activityLevel === level.value ? "text-primary-foreground/70" : "text-white/50"}`}>
                      {level.description}
                    </p>
                  </div>
                  {activityLevel === level.value && <Check className="h-5 w-5" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Result Preview */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Your Plan is Ready!</h2>
            <p className="text-sm text-white/60">Preview your personalized nutrition plan</p>
          </div>

          <div className="result-card p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <Scale className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Daily Calorie Target</p>
                <p className="text-2xl font-bold text-white">~1,850 kcal</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-lg font-bold" style={{ color: 'hsl(210 70% 82%)' }}>130g</p>
                <p className="text-[10px] text-white/50">Protein</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-lg font-bold" style={{ color: 'hsl(25 80% 80%)' }}>185g</p>
                <p className="text-[10px] text-white/50">Carbs</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-lg font-bold" style={{ color: 'hsl(275 60% 82%)' }}>62g</p>
                <p className="text-[10px] text-white/50">Fat</p>
              </div>
            </div>

            <p className="text-xs text-white/50 text-center">
              This is a preview. Purchase to get your full personalized plan with meal suggestions.
            </p>
          </div>

          <button
            onClick={() => {/* Handle purchase */}}
            className="w-full py-4 btn-primary rounded-xl font-semibold text-lg"
          >
            Get Full Plan – €19.99
          </button>

          <p className="text-xs text-white/40 text-center">
            AI-generated plan. Self-guided, no consultation included.
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="fixed bottom-6 left-4 right-4 safe-bottom">
          <button
            onClick={() => step === 2 ? handleGeneratePlan() : setStep(step + 1)}
            disabled={!canProceed || isGenerating}
            className="w-full py-4 btn-primary rounded-xl font-semibold disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your plan...
              </span>
            ) : (
              step === 2 ? "Generate My Plan" : "Continue"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
