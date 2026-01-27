import { ArrowLeft, Camera, Sparkles, Shield, HelpCircle, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">How CalorieSpot Works</h1>
      </div>

      <div className="space-y-8">
        {/* What it does */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">What CalorieSpot does</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Take a photo of your meal, and we'll estimate the calories and macronutrients 
            (protein, carbs, fat) based on what we see. It works best with plates 
            containing multiple visible foods.
          </p>
        </section>

        {/* How we estimate */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/15">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-semibold">How we estimate</h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Our AI identifies each food item on your plate, estimates portion sizes, 
              and calculates nutritional values using standard food databases.
            </p>
            <div className="space-y-2 pt-2">
              <p className="font-medium text-foreground">Portion sizes:</p>
              <ul className="space-y-1 pl-4">
                <li>🥄 <span className="text-muted-foreground">Small</span> — less than 100g</li>
                <li>🍽️ <span className="text-muted-foreground">Medium</span> — 100-200g</li>
                <li>🍲 <span className="text-muted-foreground">Large</span> — more than 200g</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Meal labels */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="font-semibold">What the labels mean</h2>
          </div>
          <div className="text-sm space-y-3">
            <div className="flex items-start gap-3">
              <span className="calorie-low font-medium whitespace-nowrap">Light bite</span>
              <span className="text-muted-foreground">Under 300 kcal — snacks, fruit, small portions</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="calorie-mid font-medium whitespace-nowrap">Balanced meal</span>
              <span className="text-muted-foreground">300-600 kcal — typical balanced meal</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="calorie-high font-medium whitespace-nowrap">Rich meal</span>
              <span className="text-muted-foreground">Over 600 kcal — larger or energy-dense meals</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 pt-2">
            These labels are just context — not judgments.
          </p>
        </section>

        {/* Macros explained */}
        <section className="result-card p-5 space-y-4">
          <h2 className="font-semibold">Understanding macros</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[hsl(210,70%,58%)] mt-1 shrink-0" />
              <div>
                <p className="font-medium macro-protein">Protein</p>
                <p className="text-muted-foreground">Helps with muscle repair and keeps you feeling full</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[hsl(32,85%,55%)] mt-1 shrink-0" />
              <div>
                <p className="font-medium macro-carbs">Carbohydrates</p>
                <p className="text-muted-foreground">Your body's main source of energy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[hsl(320,55%,62%)] mt-1 shrink-0" />
              <div>
                <p className="font-medium macro-fat">Fat</p>
                <p className="text-muted-foreground">Essential for hormones and absorbing vitamins</p>
              </div>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="font-semibold">Good to know</h2>
          </div>
          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <li>• Estimates may vary based on ingredients and preparation</li>
            <li>• Hidden ingredients (sauces, oils) can affect accuracy</li>
            <li>• Best results with clear, well-lit photos</li>
            <li>• This is not medical or dietary advice</li>
          </ul>
        </section>

        {/* Privacy */}
        <section className="glass-card p-4 text-center space-y-2">
          <p className="text-sm font-medium">Your privacy matters</p>
          <p className="text-xs text-muted-foreground">
            Images are processed only for analysis and are not stored permanently. 
            Your meal history stays on your device.
          </p>
        </section>

        {/* View Tutorial Again */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">Need a refresher?</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            View the welcome tutorial again to learn how CalorieSpot works.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("caloriespot_onboarding_complete");
              navigate("/");
            }}
            className="w-full py-3 btn-primary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            View Tutorial Again
          </button>
        </section>
      </div>

      {/* Back button */}
      <div className="mt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 btn-secondary rounded-xl font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
