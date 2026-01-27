import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSavedScans } from "@/hooks/useSavedScans";
import { useLiveScan, LiveScanResult } from "@/hooks/useLiveScan";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import { LiveScanOverlay } from "@/components/LiveScanOverlay";
import { ScanFeedback } from "@/components/ScanFeedback";
import { SpotScoreMeter } from "@/components/SpotScoreMeter";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { SplashScreen } from "@/components/SplashScreen";
import { PermissionDenied } from "@/components/PermissionDenied";
import { History, Radio, Image } from "lucide-react";
import { preprocessImage, getBase64SizeKB } from "@/lib/imageProcessor";
import { toast } from "sonner";
import {
  startScanMetrics,
  markUIResponse,
  markPreprocessComplete,
  markAIResponse,
  markFinalRender,
  resetMetrics,
} from "@/lib/performanceLogger";

type VehicleType = "car" | "motorcycle" | "unknown";

interface VehicleResult {
  vehicleType: VehicleType;
  make: string | null;
  model: string | null;
  year: number | null;
  spotScore?: number | null;
  similarModels?: string[] | null;
  confidenceScore: number | null;
  confidence: "high" | "medium" | "low" | null;
  reasoning: string | null;
  disclaimer: string;
  identifiedAt: string;
}

type AppState = "splash" | "permissionDenied" | "camera" | "liveScan" | "processing" | "result" | "error";

export default function Index() {
  const navigate = useNavigate();
  const { saveScan, storageError } = useSavedScans();
  
  const [appState, setAppState] = useState<AppState>("splash");
  const [result, setResult] = useState<VehicleResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Scanning…");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanSource, setScanSource] = useState<"camera" | "gallery">("camera");
  const cameraInitialized = useRef(false);

  // Live scan hook
  const {
    isLiveScanning,
    liveResult,
    scanStatus,
    isMotionDetected,
    startLiveScan,
    stopLiveScan,
    lockResult,
    rescan,
    setVideoRef,
    setCanvasRef,
  } = useLiveScan();

  // Handle splash complete - request camera permission
  const handleSplashComplete = useCallback(async () => {
    if (cameraInitialized.current) return;
    cameraInitialized.current = true;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      
      // Wait for video element to be available
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      });
      
      setCameraError(null);
      setAppState("camera");
    } catch (err) {
      console.log("[Camera] Permission denied or error:", err);
      setAppState("permissionDenied");
    }
  }, []);

  // Retry camera permission
  const handleRetryPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setCameraError(null);
      setAppState("camera");
    } catch (err) {
      console.log("[Camera] Retry failed:", err);
      toast.error("Camera access needed to scan vehicles");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Restart camera (used when returning from result screen)
  const restartCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setCameraError("Camera access needed");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8).replace(/^data:image\/jpeg;base64,/, "");
  }, []);


  // Shared scan pipeline - used by both camera and gallery
  const runScanPipeline = async (rawImage: string, source: "camera" | "gallery") => {
    const scanStart = performance.now();
    console.log(`[Scan] START - source: ${source}`);
    
    // Generate unique scan ID for feedback tracking
    const newScanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setScanId(newScanId);
    
    // Start performance tracking
    startScanMetrics();
    setScanSource(source);

    // IMMEDIATE UI transition - must happen within 100ms
    setCapturedImage(rawImage);
    setLoadingText("Optimizing image…");
    setAppState("processing");
    if (source === "camera") {
      stopCamera();
    }
    markUIResponse();
    console.log(`[Scan] UI ready: ${Math.round(performance.now() - scanStart)}ms`);

    // Progressive loading text updates
    const timer2s = setTimeout(() => setLoadingText("Still working…"), 3000);
    const timer5s = setTimeout(() => setLoadingText("Almost there…"), 6000);

    try {
      // ASYNC: Preprocess image - resize to 1280px, compress to 75%, strip EXIF
      const processedImage = await preprocessImage(rawImage);
      markPreprocessComplete();
      
      // Update UI to show scanning phase
      setLoadingText("Scanning…");
      
      // Log size
      const processedKB = getBase64SizeKB(processedImage);
      console.log(`[Scan] Image optimized: ${processedKB}KB, ${Math.round(performance.now() - scanStart)}ms`);

      // SINGLE AI CALL - no retries
      console.log(`[Scan] Vision request sent: ${Math.round(performance.now() - scanStart)}ms`);
      const { data, error } = await supabase.functions.invoke("identify-car", {
        body: { image: processedImage },
      });
      markAIResponse();
      console.log(`[Scan] Vision response: ${Math.round(performance.now() - scanStart)}ms`);

      // Clear timers
      clearTimeout(timer2s);
      clearTimeout(timer5s);

      if (error) {
        const status = error.context?.status;
        if (status === 400) {
          throw new Error("Bad request: Invalid image data");
        } else if (status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        } else if (status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(error.message || "Network error");
        }
      }

      if (data?.error) {
        // Check for timeout
        if (data.error.includes("timed out")) {
          throw new Error("Scan timed out, try again");
        }
        if (data.code === "IMAGE_TOO_LARGE") {
          throw new Error("Image too large. Please use a smaller image.");
        } else if (data.code === "INVALID_IMAGE") {
          throw new Error("Invalid image format.");
        } else {
          throw new Error(data.error);
        }
      }
      
      console.log(`[Scan] COMPLETE: ${Math.round(performance.now() - scanStart)}ms total`);

      const vehicleResult = data as VehicleResult;
      
      // BATCHED state update - set result and state together
      setResult(vehicleResult);
      setAppState("result");
      markFinalRender();

      // NON-BLOCKING save - fire and forget, don't block UI
      // Use queueMicrotask to ensure this runs after render
      queueMicrotask(() => {
        saveScan({
          vehicleType: vehicleResult.vehicleType,
          make: vehicleResult.make,
          model: vehicleResult.model,
          confidenceScore: vehicleResult.confidenceScore,
          spotScore: vehicleResult.spotScore ?? null,
          similarModels: vehicleResult.similarModels ?? null,
          source,
        }).then((saved) => {
          if (!saved) {
            setSaveError("Could not save scan to device.");
          }
        }).catch(() => {
          setSaveError("Could not save scan to device.");
        });
      });
    } catch (err) {
      // Clear timers on error
      clearTimeout(timer2s);
      clearTimeout(timer5s);
      resetMetrics();
      setErrorMessage(err instanceof Error ? err.message : "Failed to identify vehicle");
      setAppState("error");
    }
  };

  // Camera capture handler
  const handleCapture = async () => {
    const rawImage = captureImage();
    if (!rawImage) {
      setErrorMessage("Failed to capture image");
      setAppState("error");
      return;
    }
    await runScanPipeline(rawImage, "camera");
  };

  // Gallery photo handler - compress BEFORE any upload
  const handleGallerySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    event.target.value = "";

    // Validate file type only - NO size rejection
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    console.log(`[Gallery] Selected: ${file.name}, ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);

    try {
      // Show immediate UI feedback
      setLoadingText("Optimizing image…");
      setAppState("processing");
      
      // Compress FIRST - pass File directly (handles any size)
      const compressedBase64 = await preprocessImage(file);
      
      // Now run scan with compressed image
      await runScanPipelineWithCompressed(compressedBase64, "gallery");
    } catch (err) {
      console.error("[Gallery] Failed to process image:", err);
      toast.error("Couldn't process this image. Please try another.");
      setAppState("camera");
    }
  };

  // Separate pipeline for already-compressed images (gallery)
  const runScanPipelineWithCompressed = async (compressedImage: string, source: "camera" | "gallery") => {
    const scanStart = performance.now();
    console.log(`[Scan] START with pre-compressed image - source: ${source}`);
    
    // Generate unique scan ID for feedback tracking
    const newScanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setScanId(newScanId);
    
    startScanMetrics();
    setScanSource(source);
    setCapturedImage(compressedImage);
    setLoadingText("Scanning…");
    markPreprocessComplete();
    
    const timer3s = setTimeout(() => setLoadingText("Still working…"), 3000);
    const timer6s = setTimeout(() => setLoadingText("Almost there…"), 6000);

    try {
      const processedKB = getBase64SizeKB(compressedImage);
      console.log(`[Scan] Image size: ${processedKB}KB`);

      console.log(`[Scan] Vision request sent: ${Math.round(performance.now() - scanStart)}ms`);
      const { data, error } = await supabase.functions.invoke("identify-car", {
        body: { image: compressedImage },
      });
      markAIResponse();
      console.log(`[Scan] Vision response: ${Math.round(performance.now() - scanStart)}ms`);

      clearTimeout(timer3s);
      clearTimeout(timer6s);

      if (error) {
        const status = error.context?.status;
        if (status === 400) throw new Error("Bad request: Invalid image data");
        if (status === 429) throw new Error("Rate limit exceeded. Please try again later.");
        if (status === 500) throw new Error("Server error. Please try again later.");
        if (status === 503) throw new Error("Vision service unavailable. Please try again.");
        throw new Error(error.message || "Network error");
      }

      if (data?.error) {
        if (data.error.includes("timed out")) throw new Error("Scan timed out, try again");
        throw new Error(data.error);
      }
      
      console.log(`[Scan] COMPLETE: ${Math.round(performance.now() - scanStart)}ms total`);

      const vehicleResult = data as VehicleResult;
      setResult(vehicleResult);
      setAppState("result");
      markFinalRender();

      // Non-blocking save
      queueMicrotask(() => {
        saveScan({
          vehicleType: vehicleResult.vehicleType,
          make: vehicleResult.make,
          model: vehicleResult.model,
          confidenceScore: vehicleResult.confidenceScore,
          spotScore: vehicleResult.spotScore ?? null,
          similarModels: vehicleResult.similarModels ?? null,
          source,
        }).catch(() => setSaveError("Could not save scan to device."));
      });
    } catch (err) {
      clearTimeout(timer3s);
      clearTimeout(timer6s);
      resetMetrics();
      setErrorMessage(err instanceof Error ? err.message : "Failed to identify vehicle");
      setAppState("error");
    }
  };

  const openGalleryPicker = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    resetMetrics();
    setResult(null);
    setCapturedImage(null);
    setErrorMessage("");
    setSaveError(null);
    setScanSource("camera");
    setAppState("camera");
    restartCamera();
  };

  // Start live scanning mode
  const handleStartLiveScan = () => {
    if (videoRef.current && canvasRef.current) {
      setVideoRef(videoRef.current);
      setCanvasRef(canvasRef.current);
    }
    setAppState("liveScan");
    startLiveScan();
  };

  // Stop live scanning and return to camera
  const handleStopLiveScan = () => {
    stopLiveScan();
    setAppState("camera");
  };

  // Lock live scan result and save it
  const handleLockResult = () => {
    const lockedResult = lockResult();
    if (lockedResult) {
      // Generate unique scan ID for feedback tracking
      const newScanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setScanId(newScanId);
      
      // Capture current frame for the result
      const frame = captureImage();
      if (frame) {
        setCapturedImage(frame);
      }
      
      // Convert LiveScanResult to VehicleResult
      const vehicleResult: VehicleResult = {
        vehicleType: lockedResult.vehicleType,
        make: lockedResult.make,
        model: lockedResult.model,
        year: lockedResult.year,
        spotScore: lockedResult.spotScore,
        similarModels: lockedResult.similarModels,
        confidenceScore: lockedResult.confidenceScore,
        confidence: lockedResult.confidence,
        reasoning: lockedResult.reasoning,
        disclaimer: lockedResult.disclaimer,
        identifiedAt: lockedResult.identifiedAt,
      };
      
      setResult(vehicleResult);
      stopLiveScan();
      stopCamera();
      setAppState("result");
      
      // Save scan asynchronously
      queueMicrotask(() => {
        saveScan({
          vehicleType: lockedResult.vehicleType,
          make: lockedResult.make,
          model: lockedResult.model,
          confidenceScore: lockedResult.confidenceScore,
          spotScore: lockedResult.spotScore ?? null,
          similarModels: lockedResult.similarModels ?? null,
          source: "camera",
        }).then((saved) => {
          if (!saved) {
            setSaveError("Could not save scan to device.");
          }
        }).catch(() => {
          setSaveError("Could not save scan to device.");
        });
      });
    }
  };

  // Splash screen
  if (appState === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} minDuration={1200} />;
  }

  // Permission denied screen
  if (appState === "permissionDenied") {
    return <PermissionDenied onRetry={handleRetryPermission} />;
  }

  // Camera view - neon aesthetic
  if (appState === "camera" || appState === "liveScan") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Camera viewport with scan frame */}
        <div className="flex-1 relative scan-frame scan-frame-bottom">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-destructive mb-4">{cameraError}</p>
                <button onClick={restartCamera} className="btn-primary px-6 py-3 rounded-xl">
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Collection button - top right */}
          {appState === "camera" && (
            <button
              onClick={() => navigate("/saved")}
              className="absolute top-5 right-5 z-10 p-3 glass-card rounded-xl"
              aria-label="Collection"
            >
              <History className="h-5 w-5 text-primary" />
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleGallerySelect}
        />

        {/* Bottom controls - camera mode */}
        {appState === "camera" && (
          <div className="p-6 bg-background/95 backdrop-blur-lg border-t border-border/50">
            {/* Secondary actions */}
            <div className="flex justify-center gap-4 mb-5">
              <button
                onClick={handleStartLiveScan}
                disabled={!!cameraError}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Radio className="h-4 w-4 text-primary" />
                Live
              </button>
              <button
                onClick={openGalleryPicker}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-sm font-medium transition-colors hover:bg-muted"
              >
                <Image className="h-4 w-4 text-primary" />
                Upload
              </button>
            </div>
            
            {/* Main scan button - big, glowing */}
            <div className="flex justify-center">
              <button
                onClick={handleCapture}
                disabled={!!cameraError}
                className="scan-button w-20 h-20 disabled:opacity-40"
                aria-label="Scan"
              />
            </div>
          </div>
        )}

        {/* Live scan overlay */}
        {appState === "liveScan" && (
          <LiveScanOverlay
            liveResult={liveResult}
            scanStatus={scanStatus}
            isMotionDetected={isMotionDetected}
            onLock={handleLockResult}
            onStop={handleStopLiveScan}
            onRescan={rescan}
          />
        )}
      </div>
    );
  }

  // Processing state with skeleton result card
  if (appState === "processing") {
    return <ResultSkeleton capturedImage={capturedImage} loadingText={loadingText} />;
  }

  // Error state
  if (appState === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm glass-card p-8 rounded-2xl">
          <p className="text-destructive mb-6">{errorMessage}</p>
          <button onClick={handleReset} className="btn-primary px-8 py-3 rounded-xl font-medium">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Result view - neon aesthetic with SpotScoreMeter hero
  if (appState === "result" && result) {
    const vehicleTypeLabel = 
      result.vehicleType === "car" 
        ? "Car" 
        : result.vehicleType === "motorcycle" 
        ? "Motorcycle" 
        : null;

    const showVehicleType = result.vehicleType !== "unknown" && vehicleTypeLabel !== null;
    
    const vehicleName = result.make 
      ? `${result.make}${result.model ? ` ${result.model}` : ""}`
      : "Unknown Vehicle";

    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        {/* Captured image with rounded corners */}
        {capturedImage && (
          <div className="mb-5 rounded-2xl overflow-hidden neon-border">
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Captured"
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* Result card */}
        <div className="result-card p-6 mb-5 animate-fade-in">
          {/* 1. Vehicle Name */}
          <div className="text-center mb-6">
            {showVehicleType && (
              <span className="inline-block text-xs text-primary mb-2 uppercase tracking-widest font-medium">
                {vehicleTypeLabel}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight">
              {vehicleName}
            </h1>
          </div>

          {/* 2. Spot Score - Hero circular meter */}
          <div className="flex justify-center mb-6">
            <SpotScoreMeter score={result.spotScore ?? null} size="lg" />
          </div>

          {/* 3. Confidence badge - simple */}
          <div className="flex justify-center mb-5">
            <ConfidenceBadge score={result.confidenceScore} />
          </div>

          {/* Section divider */}
          <div className="section-divider" />

          {/* Feedback - minimal */}
          <div className="mt-4">
            <ScanFeedback
              scanId={scanId}
              detectedMake={result.make}
              detectedModel={result.model}
              detectedYear={result.year?.toString() ?? null}
              detectedVehicleType={result.vehicleType}
              confidenceScore={result.confidenceScore}
              spotScore={result.spotScore ?? null}
            />
          </div>

          {/* Save error */}
          {(saveError || storageError) && (
            <div className="mt-4 p-3 glass-card rounded-lg">
              <p className="text-xs text-warning text-center">{saveError || storageError}</p>
            </div>
          )}

          {/* Why? - collapsible */}
          {(result.reasoning || (result.model === null && result.similarModels && result.similarModels.length > 0)) && (
            <details className="mt-5">
              <summary className="text-xs cursor-pointer text-muted-foreground hover:text-primary transition-colors text-center">
                Why?
              </summary>
              <div className="mt-3 p-3 glass-card rounded-xl text-sm space-y-2">
                {result.model === null && result.similarModels && result.similarModels.length > 0 && (
                  <p className="text-muted-foreground">
                    Could be: {result.similarModels.join(", ")}
                  </p>
                )}
                {result.reasoning && (
                  <p className="text-muted-foreground">{result.reasoning}</p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Two actions only */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/saved")}
            className="flex-1 py-4 btn-secondary rounded-xl flex items-center justify-center gap-2 font-medium"
          >
            <History className="h-4 w-4" />
            Collection
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-4 btn-primary rounded-xl font-semibold"
          >
            Scan Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
