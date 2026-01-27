import { useEffect } from "react";
import { Camera, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  error: string | null;
  onCapture: () => void;
  onClose: () => void;
  isCapturing: boolean;
}

export function CameraView({
  videoRef,
  canvasRef,
  isStreaming,
  error,
  onCapture,
  onClose,
  isCapturing,
}: CameraViewProps) {
  // Prevent body scroll when camera is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Capture Car</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please allow camera access in your browser settings.
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-primary/50 rounded-2xl" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-20 left-0 right-0 text-center">
              <p className="text-sm text-white/80 bg-black/50 inline-block px-4 py-2 rounded-full">
                Center the car in frame
              </p>
            </div>
          </>
        )}
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Capture button */}
      <div className="p-6 flex justify-center safe-bottom">
        <Button
          size="lg"
          onClick={onCapture}
          disabled={!isStreaming || isCapturing}
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          {isCapturing ? (
            <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
        </Button>
      </div>
    </div>
  );
}
