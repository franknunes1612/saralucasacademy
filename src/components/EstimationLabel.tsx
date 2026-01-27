import { Eye, RefreshCw, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export type EstimationType = "visual" | "user_adjusted" | "standard_reference" | "barcode";

interface EstimationLabelProps {
  type: EstimationType;
  className?: string;
}

const ESTIMATION_LABELS: Record<EstimationType, { icon: typeof Eye; text: string; subtext: string }> = {
  visual: {
    icon: Eye,
    text: "Estimated visually from image",
    subtext: "Based on portion size and food type"
  },
  user_adjusted: {
    icon: RefreshCw,
    text: "User-adjusted portion",
    subtext: "Modified from original estimate"
  },
  standard_reference: {
    icon: Package,
    text: "Standard nutritional reference",
    subtext: "Based on average serving data"
  },
  barcode: {
    icon: Package,
    text: "From product database",
    subtext: "Scanned from barcode"
  }
};

export function EstimationLabel({ type, className }: EstimationLabelProps) {
  const config = ESTIMATION_LABELS[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 text-white/60", className)}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      <div className="text-xs">
        <span className="font-medium">{config.text}</span>
      </div>
    </div>
  );
}

export function EstimationLabelCompact({ type, className }: EstimationLabelProps) {
  const config = ESTIMATION_LABELS[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-xs",
      className
    )}>
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </div>
  );
}
