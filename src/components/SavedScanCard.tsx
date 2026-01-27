import { SavedScan } from "@/hooks/useSavedScans";
import { cn } from "@/lib/utils";

interface SavedScanCardProps {
  scan: SavedScan;
  onTap: () => void;
}

function getSpotScoreClass(score: number | null): string {
  if (score === null) return "";
  if (score >= 70) return "spot-high";
  if (score >= 30) return "spot-mid";
  return "spot-low";
}

export function SavedScanCard({ scan, onTap }: SavedScanCardProps) {
  const displayName = scan.make 
    ? `${scan.make}${scan.model ? ` ${scan.model}` : ""}`
    : "Unknown";

  return (
    <div 
      className="glass-card p-3 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onTap}
    >
      {/* Vehicle icon placeholder */}
      <div className="aspect-square rounded-xl bg-secondary/50 mb-3 flex items-center justify-center overflow-hidden">
        <div className="text-3xl">
          {scan.vehicleType === "motorcycle" ? "🏍️" : "🚗"}
        </div>
      </div>

      {/* Vehicle name - truncated */}
      <p className="font-semibold text-sm text-foreground truncate mb-1">
        {displayName}
      </p>

      {/* Spot Score badge */}
      {scan.spotScore !== null && (
        <div className={cn("text-xl font-bold", getSpotScoreClass(scan.spotScore))}>
          {scan.spotScore}
        </div>
      )}
    </div>
  );
}
