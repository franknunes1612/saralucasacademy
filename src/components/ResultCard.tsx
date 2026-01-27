import { CarIdentificationResult } from "@/hooks/useCarIdentification";
import { SpotScoreMeter } from "./SpotScoreMeter";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ScanFeedback } from "./ScanFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Share2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ResultCardProps {
  result: CarIdentificationResult;
  capturedImage: string | null;
  scanId: string;
  onScanAgain: () => void;
}

export function ResultCard({ result, capturedImage, scanId, onScanAgain }: ResultCardProps) {
  const isIdentified = result.make !== null;

  const handleShare = async () => {
    if (!navigator.share) {
      toast.error("Sharing not supported on this device");
      return;
    }

    try {
      const spotScoreText = result.spotScore !== null 
        ? ` with a Spot Score of ${result.spotScore}` 
        : "";
      
      await navigator.share({
        title: isIdentified
          ? `${result.make} ${result.model || ""} - SpotRare`
          : "Vehicle Spotted - SpotRare",
        text: isIdentified
          ? `I spotted a ${result.make} ${result.model || ""}${spotScoreText}!`
          : "I spotted a vehicle but couldn't identify it.",
        url: window.location.href,
      });
    } catch (err) {
      // User cancelled or error
      console.log("Share cancelled");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 safe-bottom">
      {/* Captured image preview */}
      {capturedImage && (
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-secondary">
          <img
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt="Captured vehicle"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Result card */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {isIdentified ? (
            <div className="flex flex-col items-center gap-6">
              {/* Vehicle info */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {result.make}
                </h2>
                {result.model && (
                  <p className="text-xl text-muted-foreground">{result.model}</p>
                )}
                {result.year && (
                  <p className="text-sm text-muted-foreground">{result.year}</p>
                )}
              </div>

              {/* Spot Score meter - hidden if null */}
              <SpotScoreMeter score={result.spotScore} size="lg" />

              {/* Confidence badge */}
              <ConfidenceBadge score={result.confidenceScore} />

              {/* Feedback section */}
              <ScanFeedback
                scanId={scanId}
                detectedMake={result.make}
                detectedModel={result.model}
                detectedYear={result.year?.toString() ?? null}
                detectedVehicleType="unknown"
                confidenceScore={result.confidenceScore}
                spotScore={result.spotScore}
              />

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                {result.disclaimer}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Couldn't Identify
                </h2>
                <p className="text-muted-foreground mt-1">
                  We couldn't confidently identify this vehicle. Try capturing from a different angle.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          className="flex-1"
          disabled={!isIdentified}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
        <Button size="lg" onClick={onScanAgain} className="flex-1">
          <Camera className="h-5 w-5 mr-2" />
          Scan Again
        </Button>
      </div>
    </div>
  );
}
