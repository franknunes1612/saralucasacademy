import { ArrowLeft, Camera, Sparkles, Shield, HelpCircle, RotateCcw, ChefHat, GraduationCap, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";


export default function HowItWorks() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
        <h1 className="text-xl font-bold tracking-tight">
          {t({ pt: "Como Funciona", en: "How It Works" })}
        </h1>
      </div>

      {/* Academy Section */}
      <div className="space-y-8 mb-10">
        <section className="result-card p-5 space-y-4 border-l-4 border-primary">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">
              {t({ pt: "Academia Sara Lucas", en: "Sara Lucas Academy" })}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t({
              pt: "A nossa academia oferece cursos, programas e ebooks para transformar a tua alimentação e estilo de vida.",
              en: "Our academy offers courses, programs and ebooks to transform your nutrition and lifestyle.",
            })}
          </p>
        </section>

        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/15">
              <BookOpen className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="font-semibold">
              {t({ pt: "Cursos & Programas", en: "Courses & Programs" })}
            </h2>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              {t({
                pt: "Os cursos incluem vídeo-aulas com lições passo a passo. Acompanha o teu progresso enquanto aprendes.",
                en: "Courses include video lessons with step-by-step guidance. Track your progress as you learn.",
              })}
            </p>
            <ul className="space-y-1 pl-4">
              <li>📚 {t({ pt: "Acesso vitalício após compra", en: "Lifetime access after purchase" })}</li>
              <li>🎯 {t({ pt: "Progresso guardado automaticamente", en: "Progress saved automatically" })}</li>
              <li>📱 {t({ pt: "Assiste em qualquer dispositivo", en: "Watch on any device" })}</li>
            </ul>
          </div>
          <button
            onClick={() => navigate("/learn?type=course")}
            className="w-full py-3 btn-secondary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {t({ pt: "Ver Cursos", en: "View Courses" })}
          </button>
        </section>

        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/15">
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="font-semibold">
              {t({ pt: "Programas de Transformação", en: "Transformation Programs" })}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t({
              pt: "Programas intensivos com acompanhamento estruturado para alcançares os teus objetivos de saúde e fitness.",
              en: "Intensive programs with structured guidance to help you reach your health and fitness goals.",
            })}
          </p>
          <button
            onClick={() => navigate("/learn?type=program")}
            className="w-full py-3 btn-secondary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            {t({ pt: "Ver Programas", en: "View Programs" })}
          </button>
        </section>

        <div className="h-px bg-border my-6" />

        <h2 className="font-semibold text-lg px-1">
          {t({ pt: "Ferramentas do Scanner", en: "Scanner Tools" })}
        </h2>
      </div>

      <div className="space-y-8">
        {/* What it does */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">What the food scanner does</h2>
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

        {/* Fit Recipes */}
        <section className="result-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/15">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">Healthy recipes</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explore our collection of fit recipes with calorie and macro information.
          </p>
          <button
            onClick={() => navigate("/recipes")}
            className="w-full py-3 btn-secondary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <ChefHat className="h-4 w-4" />
            View Fit Recipes
          </button>
        </section>

        {/* Personalized guidance hint */}
        <section className="result-card p-5 space-y-3">
          <h2 className="font-semibold">Want personalized guidance?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap the chat button in the corner to connect with a professional nutritionist.
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
            View the welcome tutorial again to learn how the app works.
          </p>
          <button
            onClick={() => {
              // Clear session onboarding state so splash + onboarding shows again
              sessionStorage.removeItem("saralucas_onboarding_session");
              // Also clear legacy localStorage key if present
              localStorage.removeItem("saralucas_onboarding_complete");
              navigate("/");
            }}
            className="w-full py-3 btn-secondary rounded-xl font-medium flex items-center justify-center gap-2"
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
