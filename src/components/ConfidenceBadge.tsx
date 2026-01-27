import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number | null;
}

function getLabel(score: number | null): string {
  if (score === null) return "Rough estimate";
  if (score >= 80) return "Estimated from image";
  if (score >= 60) return "Best guess";
  return "Rough estimate";
}

function getClass(score: number | null): string {
  if (score === null) return "confidence-low";
  if (score >= 80) return "confidence-high";
  if (score >= 60) return "confidence-medium";
  return "confidence-low";
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const label = getLabel(score);
  const className = getClass(score);

  return (
    <span className={cn("inline-block px-3 py-1.5 text-xs font-medium rounded-full", className)}>
      {label}
    </span>
  );
}
