import { useNavigate } from "react-router-dom";
import { Camera, ScanBarcode, Apple, ChefHat, History, ChevronRight, HelpCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { WaterTracker } from "@/components/WaterTracker";
import { useCmsContent } from "@/hooks/useCmsContent";

interface ToolItem {
  id: string;
  icon: typeof Camera;
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  color: string;
  action: () => void;
}

export default function Tools() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cms = useCmsContent();

  const tools: ToolItem[] = [
    {
      id: "food-scan",
      icon: Camera,
      title: { pt: "Scanner de Alimentos", en: "Food Scanner" },
      description: { pt: "Analisa calorias e macros com a câmara", en: "Analyze calories and macros with camera" },
      color: "bg-success/20 text-success",
      action: () => navigate("/scan?direct=1"),
    },
    {
      id: "barcode-scan",
      icon: ScanBarcode,
      title: { pt: "Leitor de Código de Barras", en: "Barcode Scanner" },
      description: { pt: "Lê produtos embalados automaticamente", en: "Read packaged products automatically" },
      color: "bg-secondary/20 text-secondary",
      action: () => navigate("/scan?mode=barcode"),
    },
    {
      id: "meal-history",
      icon: History,
      title: { pt: "Histórico de Refeições", en: "Meal History" },
      description: { pt: "Ver refeições guardadas", en: "View saved meals" },
      color: "bg-primary/30 text-white",
      action: () => navigate("/meals"),
    },
    {
      id: "recipes",
      icon: ChefHat,
      title: { pt: "Receitas Fit", en: "Fit Recipes" },
      description: { pt: "Receitas saudáveis e equilibradas", en: "Healthy and balanced recipes" },
      color: "bg-warning/20 text-warning",
      action: () => navigate("/recipes"),
    },
    {
      id: "support",
      icon: HelpCircle,
      title: { pt: "Ajuda & Suporte", en: "Help & Support" },
      description: { pt: "Questões técnicas e apoio", en: "Technical questions and support" },
      color: "bg-muted/40 text-white/70",
      action: () => navigate("/support"),
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pt-5 pb-24 safe-top">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t({ pt: "Ferramentas", en: "Tools" })}
        </h1>
        <p className="text-xs text-white/80">
          {t({ pt: "Apoio à tua jornada nutricional", en: "Support your nutrition journey" })}
        </p>
      </div>

      {/* Water Tracker */}
      <div className="mb-6">
        <WaterTracker />
      </div>

      {/* Tools Grid */}
      <div className="space-y-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.action}
            className="result-card p-5 w-full flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
          >
            <div className={`p-3 rounded-xl ${tool.color}`}>
              <tool.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{t(tool.title)}</h3>
              <p className="text-sm text-white/80">{t(tool.description)}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/30" />
          </button>
        ))}
      </div>

      {/* Info Card */}
      <div className="mt-6 result-card p-5">
        <div className="flex items-start gap-3">
          <Apple className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1">
              {t({ pt: "Ferramentas de apoio", en: "Support tools" })}
            </h3>
            <p className="text-sm text-white/70">
              {t({
                pt: "Estas ferramentas complementam a tua aprendizagem na Academia. Usa o scanner para entender melhor os alimentos do dia a dia.",
                en: "These tools complement your learning in the Academy. Use the scanner to better understand everyday foods.",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
