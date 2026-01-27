interface ResultSkeletonProps {
  capturedImage: string | null;
  loadingText: string;
}

export function ResultSkeleton({ capturedImage, loadingText }: ResultSkeletonProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Captured image with scan effect */}
      {capturedImage && (
        <div className="relative flex-shrink-0">
          <img
            src={`data:image/jpeg;base64,${capturedImage}`}
            alt="Scanning"
            className="w-full h-56 object-cover"
          />
          {/* Scan line overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>
          {/* Scan corners */}
          <div className="absolute inset-0 scan-frame scan-frame-bottom" />
        </div>
      )}

      {/* Loading card */}
      <div className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
        {/* Pulsing ring */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-muted flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse-ring" />
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        {/* Status text */}
        <p className="text-lg font-medium text-foreground mb-2">{loadingText}</p>
        <p className="text-sm text-muted-foreground">Hold steady</p>
      </div>
    </div>
  );
}
