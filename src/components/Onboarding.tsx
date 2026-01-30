import { useState } from "react";
import { Camera, Sparkles, History, ChevronRight, ChevronLeft, MessageCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface OnboardingProps {
  onComplete: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  note?: string;
  icon: React.ReactNode;
  illustration: React.ReactNode;
}

// Screen 1: Scan illustration (camera + food)
const ScanIllustration = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
    {/* Phone frame */}
    <div className="relative w-28 h-48 rounded-3xl bg-white/15 border-2 border-white/30 overflow-hidden shadow-xl">
      {/* Screen */}
      <div className="absolute inset-2 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
        {/* Camera viewfinder */}
        <div className="absolute inset-4 rounded-xl border-2 border-dashed border-white/40 flex items-center justify-center">
          <div className="text-3xl">🍔</div>
        </div>
        {/* Scan corners */}
        <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-white/70 rounded-tl" />
        <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-white/70 rounded-tr" />
        <div className="absolute bottom-12 left-4 w-4 h-4 border-l-2 border-b-2 border-white/70 rounded-bl" />
        <div className="absolute bottom-12 right-4 w-4 h-4 border-r-2 border-b-2 border-white/70 rounded-br" />
      </div>
      {/* Scan button */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-primary" />
      </div>
    </div>
    {/* Flash effect */}
    <div className="absolute -right-2 top-1/3 w-12 h-12 rounded-full bg-white/30 blur-xl animate-pulse" />
    {/* Sparkles */}
    <Sparkles className="absolute top-2 left-2 h-5 w-5 text-white/60 animate-pulse" />
  </div>
);

// Screen 2: Track illustration (history cards + progress)
const TrackIllustration = () => (
  <div className="relative w-48 h-48 mx-auto">
    {/* Stacked cards */}
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-24 rounded-2xl bg-white/10 border border-white/20 rotate-6 transform" />
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-24 rounded-2xl bg-white/15 border border-white/25 -rotate-3 transform" />
    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-24 rounded-2xl bg-white/20 border border-white/30 shadow-lg overflow-hidden">
      {/* Card content */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center text-sm">
            🍝
          </div>
          <div className="flex-1">
            <div className="h-2 w-16 bg-white/40 rounded" />
            <div className="h-1.5 w-10 bg-white/30 rounded mt-1" />
          </div>
          <div className="text-xs text-white font-medium">~420</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center text-sm">
            🥗
          </div>
          <div className="flex-1">
            <div className="h-2 w-14 bg-white/40 rounded" />
            <div className="h-1.5 w-8 bg-white/30 rounded mt-1" />
          </div>
          <div className="text-xs text-white font-medium">~180</div>
        </div>
      </div>
    </div>
    {/* Total badge */}
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/25 border border-white/30">
      <span className="text-sm font-semibold text-white">1,240 kcal today</span>
    </div>
  </div>
);

// Screen 3: Nutritionist illustration (person + chat)
const NutritionistIllustration = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
    {/* Person silhouette circle */}
    <div className="relative w-28 h-28 rounded-full bg-white/20 border-2 border-white/30 shadow-lg flex items-center justify-center">
      {/* Person icon */}
      <div className="text-5xl">👩‍⚕️</div>
    </div>
    {/* Chat bubble */}
    <div className="absolute -right-2 top-4 bg-white/25 border border-white/30 rounded-2xl rounded-br-sm px-3 py-2 shadow-lg">
      <MessageCircle className="h-5 w-5 text-white" />
    </div>
    {/* Floating elements */}
    <div className="absolute bottom-4 -left-2 px-2 py-1 rounded-full bg-white/20 text-xs text-white font-medium">
      🇵🇹 🇬🇧
    </div>
    {/* Sparkle */}
    <Sparkles className="absolute top-0 left-4 h-5 w-5 text-white/60 animate-pulse" />
    {/* Glow ring */}
    <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
  </div>
);

// Localized content for onboarding steps - Sara Lucas Academy brand
const getLocalizedSteps = (language: "pt" | "en"): OnboardingStep[] => {
  if (language === "pt") {
    return [
      {
        title: "Bem-vindo à Sara Lucas Academy",
        description: "A tua academia de nutrição e treino. Cursos, ebooks e programas criados por uma nutricionista certificada para transformar a tua saúde.",
        icon: <BookOpen className="h-6 w-6" />,
        illustration: <NutritionistIllustration />,
      },
      {
        title: "Consulta de Nutrição",
        description: "Agenda uma consulta personalizada comigo. Um serviço profissional e pago, adaptado aos teus objetivos específicos.",
        note: "Disponível em Português ou Inglês via WhatsApp.",
        icon: <MessageCircle className="h-6 w-6" />,
        illustration: <TrackIllustration />,
      },
      {
        title: "Ferramentas de Apoio",
        description: "Usa o scanner de alimentos e outras ferramentas para apoiar a tua jornada. Complementos práticos para a tua aprendizagem.",
        icon: <Camera className="h-6 w-6" />,
        illustration: <ScanIllustration />,
      },
    ];
  }
  
  // English (default)
  return [
    {
      title: "Welcome to Sara Lucas Academy",
      description: "Your nutrition and training academy. Courses, ebooks and programs created by a certified nutritionist to transform your health.",
      icon: <BookOpen className="h-6 w-6" />,
      illustration: <NutritionistIllustration />,
    },
    {
      title: "Nutrition Consultation",
      description: "Book a personalized consultation with me. A professional, paid service tailored to your specific goals.",
      note: "Available in Portuguese or English via WhatsApp.",
      icon: <MessageCircle className="h-6 w-6" />,
      illustration: <TrackIllustration />,
    },
    {
      title: "Support Tools",
      description: "Use the food scanner and other tools to support your journey. Practical add-ons for your learning experience.",
      icon: <Camera className="h-6 w-6" />,
      illustration: <ScanIllustration />,
    },
  ];
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const { language } = useLanguage();
  const STEPS = getLocalizedSteps(language);
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4 safe-top">
        <button
          onClick={handleSkip}
          className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Illustration */}
        <div className="mb-8 animate-fade-in" key={currentStep}>
          {step.illustration}
        </div>

        {/* Text content */}
        <div className="text-center max-w-xs animate-fade-in" key={`text-${currentStep}`}>
          <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
            {step.title}
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            {step.description}
          </p>
          {step.note && (
            <p className="text-white/50 text-sm mt-3">
              {step.note}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 safe-bottom space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                index === currentStep
                  ? "bg-white w-6"
                  : "bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-4 rounded-xl bg-white/15 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/25 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={cn(
                "flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                isLast
                  ? "bg-white text-primary shadow-lg hover:shadow-xl"
                  : "bg-white text-primary hover:bg-white/90"
              )}
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
          {/* Microcopy on last screen */}
          {isLast && (
            <p className="text-center text-white/50 text-xs">
              You can book a nutritionist anytime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
