import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSavedScans, SavedScan } from "@/hooks/useSavedScans";
import { SavedScanCard } from "@/components/SavedScanCard";
import { SpotScoreMeter } from "@/components/SpotScoreMeter";
import { ArrowLeft, Trash2, Camera } from "lucide-react";

// Calculate total Spot Score with deduplication
function calculateTotalSpotScore(scans: SavedScan[]): number {
  const vehicleScores = new Map<string, number>();
  
  for (const scan of scans) {
    if (scan.spotScore === null) continue;
    const key = `${(scan.make ?? "").toLowerCase()}|${(scan.model ?? "").toLowerCase()}`;
    const existing = vehicleScores.get(key) ?? 0;
    if (scan.spotScore > existing) {
      vehicleScores.set(key, scan.spotScore);
    }
  }
  
  let total = 0;
  for (const score of vehicleScores.values()) total += score;
  return total;
}

function getSpotScoreClass(score: number | null): string {
  if (score === null) return "";
  if (score >= 70) return "spot-high";
  if (score >= 30) return "spot-mid";
  return "spot-low";
}

export default function SavedScans() {
  const navigate = useNavigate();
  const { scans, deleteScan, clearAllScans, storageError, isLoading, isSupported, reloadScans } = useSavedScans();
  const [selectedScan, setSelectedScan] = useState<SavedScan | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    reloadScans();
  }, [reloadScans]);

  const totalSpotScore = useMemo(() => calculateTotalSpotScore(scans), [scans]);

  const handleBack = () => {
    if (selectedScan) {
      setSelectedScan(null);
    } else {
      navigate("/");
    }
  };

  const handleClearAll = async () => {
    await clearAllScans();
    setShowClearConfirm(false);
  };

  // Detail view
  if (selectedScan) {
    const displayName = selectedScan.make 
      ? `${selectedScan.make}${selectedScan.model ? ` ${selectedScan.model}` : ""}`
      : "Unknown";
    
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Details</h1>
        </div>

        <div className="result-card p-6 text-center">
          {/* Vehicle icon */}
          <div className="text-5xl mb-4">
            {selectedScan.vehicleType === "motorcycle" ? "🏍️" : "🚗"}
          </div>

          {/* Vehicle name */}
          <h2 className="text-2xl font-bold mb-6">{displayName}</h2>

          {/* Spot Score meter */}
          <div className="flex justify-center mb-6">
            <SpotScoreMeter score={selectedScan.spotScore} size="md" animated={false} />
          </div>

          {/* Timestamp */}
          <p className="text-sm text-muted-foreground mb-6">
            {new Date(selectedScan.timestamp).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <p className="text-xs text-muted-foreground/60">
            Stored locally only
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={async () => {
            await deleteScan(selectedScan.id);
            setSelectedScan(null);
          }}
          className="w-full mt-5 py-4 glass-card rounded-xl text-destructive flex items-center justify-center gap-2 font-medium transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    );
  }

  // Collection list view
  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Collection</h1>
        </div>
        
        {scans.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Total Spot Score - Hero */}
      {scans.length > 0 && (
        <div className="result-card p-6 mb-6 text-center">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Total Score</p>
          <div className="text-6xl font-bold spot-mid mb-2">{totalSpotScore}</div>
          <p className="text-sm text-muted-foreground">
            {scans.length} vehicle{scans.length === 1 ? "" : "s"} spotted
          </p>
        </div>
      )}

      {/* Not supported */}
      {!isSupported && (
        <div className="glass-card p-4 rounded-xl mb-5">
          <p className="text-sm text-warning text-center">Storage not supported</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && isSupported && (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}

      {/* Storage error */}
      {storageError && isSupported && (
        <div className="glass-card p-4 rounded-xl mb-5">
          <p className="text-sm text-warning text-center">{storageError}</p>
        </div>
      )}

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="glass-card p-5 rounded-xl mb-5 animate-fade-in">
          <p className="text-sm mb-4 text-center">Delete all vehicles?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 py-3 btn-secondary rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && isSupported && scans.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg font-medium mb-2">Start spotting!</p>
          <p className="text-sm text-muted-foreground mb-6">
            Your finds appear here
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Scan Now
          </button>
        </div>
      ) : !isLoading && isSupported ? (
        /* Grid of vehicles */
        <div className="grid grid-cols-2 gap-3">
          {scans.map((scan) => (
            <SavedScanCard
              key={scan.id}
              scan={scan}
              onTap={() => setSelectedScan(scan)}
            />
          ))}
        </div>
      ) : null}

      {/* Privacy footer */}
      {isSupported && scans.length > 0 && (
        <p className="text-xs text-muted-foreground/50 mt-6 text-center">
          Saved locally · Images never stored
        </p>
      )}
    </div>
  );
}
