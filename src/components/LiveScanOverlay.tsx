import { X, Lock, RotateCcw, Camera } from "lucide-react";
import { LiveScanResult } from "@/hooks/useLiveScan";

interface LiveScanOverlayProps {
  liveResult: LiveScanResult | null;
  scanStatus: "waiting" | "scanning" | "locked";
  isMotionDetected: boolean;
  onLock: () => void;
  onStop: () => void;
  onRescan: () => void;
}

/**
 * Overlay-only component for Live Scan mode.
 * Does NOT contain video element - that stays in parent.
 */
export function LiveScanOverlay({
  liveResult,
  scanStatus,
  isMotionDetected,
  onLock,
  onStop,
  onRescan,
}: LiveScanOverlayProps) {
  // Get confidence color class
  const getConfidenceClass = (score: number | null): string => {
    if (score === null) return "text-muted-foreground";
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-muted-foreground";
  };

  // Get status display
  const getStatusDisplay = () => {
    switch (scanStatus) {
      case "waiting":
        if (isMotionDetected) {
          return (
            <div className="flex items-center gap-2 text-white/60">
              <Camera className="h-4 w-4" />
              <span>Hold steady to scan…</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2 text-yellow-400">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>Preparing…</span>
          </div>
        );
      case "scanning":
        return (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Scanning…</span>
          </div>
        );
      case "locked":
        return (
          <div className="flex items-center gap-2 text-green-400">
            <Lock className="h-4 w-4" />
            <span>Result locked</span>
          </div>
        );
    }
  };

  // Render result
  const renderResult = () => {
    if (scanStatus === "waiting" && !liveResult) {
      return (
        <div className="text-center py-4">
          <p className="text-white/60 text-sm">Point at a vehicle and hold steady</p>
        </div>
      );
    }

    if (scanStatus === "scanning" && !liveResult) {
      return (
        <div className="text-center py-4">
          <p className="text-white/60 text-sm">Identifying…</p>
        </div>
      );
    }

    if (!liveResult) return null;

    const { vehicleType, make, model, confidenceScore } = liveResult;

    return (
      <div className="space-y-2">
        {vehicleType !== "unknown" && (
          <p className="text-xs text-white/60 uppercase tracking-wide">
            {vehicleType === "car" ? "Car" : "Motorcycle"}
          </p>
        )}
        
        {make && (
          <p className="text-2xl font-bold text-white">
            {make}
            {model && <span className="text-lg text-white/80 ml-2">{model}</span>}
          </p>
        )}

        {!make && vehicleType === "unknown" && (
          <p className="text-lg text-white/60">No vehicle detected</p>
        )}

        {confidenceScore !== null && make && (
          <p className={`text-xs ${getConfidenceClass(confidenceScore)}`}>
            {confidenceScore}% confidence
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${
              scanStatus === "locked" ? "bg-green-500" : "bg-red-500 animate-pulse"
            }`} />
          </div>
          <span className="text-white font-medium">Live Scan</span>
        </div>
        <button
          onClick={onStop}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Stop live scan"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Focus frame overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className={`absolute inset-12 border-2 rounded-2xl transition-colors duration-300 ${
          scanStatus === "locked" 
            ? "border-green-500/70" 
            : scanStatus === "scanning"
            ? "border-blue-400/70"
            : isMotionDetected 
            ? "border-white/30" 
            : "border-yellow-400/70"
        }`} />
      </div>

      {/* Bottom result panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-8 space-y-4 z-20">
        {/* Status indicator */}
        <div className="text-sm">
          {getStatusDisplay()}
        </div>

        {/* Result display */}
        {renderResult()}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2 pb-safe">
          {scanStatus === "locked" ? (
            <>
              <button
                onClick={onRescan}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Scan Again
              </button>
              <button
                onClick={onLock}
                className="flex-1 py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="h-4 w-4" />
                Save & Exit
              </button>
            </>
          ) : (
            <button
              onClick={onStop}
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center gap-2 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
}
