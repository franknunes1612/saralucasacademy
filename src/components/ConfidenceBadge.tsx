import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number | null;
}

function getLabel(score: number | null): string {
  if (score === null) return "Low";
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
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
    <span className={cn("inline-block px-3 py-1 text-xs font-medium rounded-full", className)}>
      {label}
    </span>
  );
}
