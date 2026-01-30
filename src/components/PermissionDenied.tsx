import { Camera } from "lucide-react";

interface PermissionDeniedProps {
  onRetry: () => void;
}

export function PermissionDenied({ onRetry }: PermissionDeniedProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card p-8 rounded-2xl max-w-sm text-center animate-fade-in">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
          <Camera className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-3">Camera Access Needed</h2>

        {/* Explanation */}
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          This app uses your camera to identify food and estimate calories. 
          No images are stored or uploaded.
        </p>

        {/* Retry button */}
        <button
          onClick={onRetry}
          className="w-full py-4 btn-primary rounded-xl font-semibold"
        >
          Enable Camera
        </button>

        {/* Help text */}
        <p className="text-xs text-muted-foreground/60 mt-4">
          You may need to enable camera in your device settings
        </p>
      </div>
    </div>
  );
}
