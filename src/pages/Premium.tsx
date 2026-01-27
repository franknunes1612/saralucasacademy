import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Dumbbell, Heart, Gift } from "lucide-react";

interface PremiumCardProps {
  icon: typeof Sparkles;
  title: string;
  description: string;
  price?: string;
  cta: string;
  onClick: () => void;
  badge?: string;
  accentColor?: string;
}

function PremiumCard({ 
  icon: Icon, 
  title, 
  description, 
  price, 
  cta, 
  onClick,
  badge,
  accentColor = "bg-primary"
}: PremiumCardProps) {
  return (
    <div className="result-card p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${accentColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{title}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        {price && (
          <span className="text-lg font-bold text-white">{price}</span>
        )}
        <button 
          onClick={onClick}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium ml-auto"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

export default function Premium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Premium Features</h1>
      </div>

      {/* Hero section */}
      <div className="result-card p-6 mb-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Level Up Your Nutrition
        </h2>
        <p className="text-sm text-white/70 max-w-xs mx-auto">
          Get personalized plans, on-demand workouts, and curated product recommendations.
        </p>
      </div>

      {/* Premium cards */}
      <div className="space-y-4">
        <PremiumCard
          icon={Sparkles}
          title="Personalized Nutrition Plan"
          description="AI-generated custom nutrition and training plan tailored to your goals. Self-guided program, no consultation required."
          price="€19.99"
          cta="Get My Plan"
          onClick={() => navigate("/premium/plans")}
          badge="Most Popular"
          accentColor="bg-gradient-to-br from-primary to-secondary"
        />

        <PremiumCard
          icon={Dumbbell}
          title="Training Classes"
          description="On-demand workout videos for all fitness levels. Cardio, strength, HIIT, yoga, and more."
          price="€9.99/mo"
          cta="Browse Classes"
          onClick={() => navigate("/premium/training")}
          accentColor="bg-success"
        />

        <PremiumCard
          icon={Heart}
          title="Product Favorites"
          description="Curated healthy products recommended by nutritionists. Save your favorites and shop with affiliate links."
          cta="Explore Products"
          onClick={() => navigate("/premium/products")}
          accentColor="bg-secondary"
        />

        <PremiumCard
          icon={Gift}
          title="Gift a Plan"
          description="Send a personalized nutrition plan to a friend or family member."
          price="€24.99"
          cta="Gift Now"
          onClick={() => navigate("/premium/gift")}
          accentColor="bg-warning"
        />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-white/40 text-center mt-8 px-4">
        All purchases are non-refundable. Personalized plans are AI-generated and self-guided. 
        Not a substitute for professional medical advice.
      </p>
    </div>
  );
}
