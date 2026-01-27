import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSavedMeals, FoodItem } from "@/hooks/useSavedMeals";
import { useLiveFoodScan, LiveFoodResult } from "@/hooks/useLiveFoodScan";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import { LiveFoodOverlay } from "@/components/LiveFoodOverlay";
import { MealFeedback } from "@/components/MealFeedback";
import { CalorieMeter } from "@/components/CalorieMeter";
import { FoodItemsList } from "@/components/FoodItemsList";
import { MacrosBadge } from "@/components/MacrosBadge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { SplashScreen } from "@/components/SplashScreen";
import { PermissionDenied } from "@/components/PermissionDenied";
import { BarcodeScannerView } from "@/components/BarcodeScannerView";
import { BarcodeResultCard } from "@/components/BarcodeResultCard";
import { PortionFeedback, PortionAdjustment } from "@/components/PortionFeedback";
import { MealToneBadge } from "@/components/MealToneBadge";
import { History, Radio, Image, ScanBarcode, HelpCircle } from "lucide-react";
import { preprocessImage, getBase64SizeKB } from "@/lib/imageProcessor";
import { toast } from "sonner";
import { safeNumber, getCalorieValue, hasValidCalories } from "@/lib/nutritionUtils";
import {
  startScanMetrics,
  markUIResponse,
  markPreprocessComplete,
  markAIResponse,
  markFinalRender,
  resetMetrics,
} from "@/lib/performanceLogger";

type PlateType = "single_item" | "half_plate" | "full_plate" | "mixed_dish" | "bowl" | "snack";

interface FoodResult {
  foodDetected: boolean;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  calorieRange: { min: number; max: number } | null;
  confidenceScore: number | null;
  confidence: "high" | "medium" | "low" | null;
  reasoning: string | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  plateType: PlateType;
  disclaimer: string;
  identifiedAt: string;
}

type AppState = "splash" | "permissionDenied" | "camera" | "liveScan" | "barcodeScan" | "barcodeResult" | "processing" | "result" | "error";

interface BarcodeProduct {
  name: string;
  brand: string | null;
  servingSize: string | null;
  calories: number | null;
  caloriesPer100g: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  imageUrl: string | null;
}

export default function Index() {
  const navigate = useNavigate();
  const { saveMeal, storageError } = useSavedMeals();
  
  const [appState, setAppState] = useState<AppState>("splash");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Scanning…");
  const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [adjustedCalories, setAdjustedCalories] = useState<number | null>(null);
  const [portionAdjustment, setPortionAdjustment] = useState<PortionAdjustment | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanSource, setScanSource] = useState<"camera" | "gallery" | "barcode">("camera");
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
  } = useLiveFoodScan();

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
      toast.error("Camera access needed to scan food");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Restart camera
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

  // Shared scan pipeline
  const runScanPipeline = async (rawImage: string, source: "camera" | "gallery") => {
    const scanStart = performance.now();
    console.log(`[Scan] START - source: ${source}`);
    
    const newScanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setScanId(newScanId);
    
    startScanMetrics();
    setScanSource(source);

    setCapturedImage(rawImage);
    setLoadingText("Optimizing image…");
    setAppState("processing");
    if (source === "camera") {
      stopCamera();
    }
    markUIResponse();
    console.log(`[Scan] UI ready: ${Math.round(performance.now() - scanStart)}ms`);

    const timer2s = setTimeout(() => setLoadingText("Analyzing food…"), 3000);
    const timer5s = setTimeout(() => setLoadingText("Almost there…"), 6000);

    try {
      const processedImage = await preprocessImage(rawImage);
      markPreprocessComplete();
      
      setLoadingText("Scanning…");
      
      const processedKB = getBase64SizeKB(processedImage);
      console.log(`[Scan] Image optimized: ${processedKB}KB, ${Math.round(performance.now() - scanStart)}ms`);

      console.log(`[Scan] Vision request sent: ${Math.round(performance.now() - scanStart)}ms`);
      const { data, error } = await supabase.functions.invoke("identify-food", {
        body: { image: processedImage },
      });
      markAIResponse();
      console.log(`[Scan] Vision response: ${Math.round(performance.now() - scanStart)}ms`);

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

      const foodResult = data as FoodResult;
      
      setResult(foodResult);
      setAppState("result");
      markFinalRender();

      // Non-blocking save with image
      queueMicrotask(() => {
        saveMeal({
          items: foodResult.items,
          totalCalories: foodResult.totalCalories,
          confidenceScore: foodResult.confidenceScore,
          macros: foodResult.macros,
          source,
          imageData: rawImage, // Pass captured image for thumbnail
        }).then((saved) => {
          if (!saved) {
            setSaveError("Could not save meal to device.");
          }
        }).catch(() => {
          setSaveError("Could not save meal to device.");
        });
      });
    } catch (err) {
      clearTimeout(timer2s);
      clearTimeout(timer5s);
      resetMetrics();
      setErrorMessage(err instanceof Error ? err.message : "Failed to identify food");
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

  // Gallery photo handler
  const handleGallerySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    console.log(`[Gallery] Selected: ${file.name}, ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);

    try {
      setLoadingText("Optimizing image…");
      setAppState("processing");
      
      const compressedBase64 = await preprocessImage(file);
      
      await runScanPipelineWithCompressed(compressedBase64, "gallery");
    } catch (err) {
      console.error("[Gallery] Failed to process image:", err);
      toast.error("Couldn't process this image. Please try another.");
      setAppState("camera");
    }
  };

  // Pipeline for already-compressed images
  const runScanPipelineWithCompressed = async (compressedImage: string, source: "camera" | "gallery") => {
    const scanStart = performance.now();
    console.log(`[Scan] START with pre-compressed image - source: ${source}`);
    
    const newScanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setScanId(newScanId);
    
    startScanMetrics();
    setScanSource(source);
    setCapturedImage(compressedImage);
    setLoadingText("Analyzing food…");
    markPreprocessComplete();
    
    const timer3s = setTimeout(() => setLoadingText("Still working…"), 3000);
    const timer6s = setTimeout(() => setLoadingText("Almost there…"), 6000);

    try {
      const processedKB = getBase64SizeKB(compressedImage);
      console.log(`[Scan] Image size: ${processedKB}KB`);

      console.log(`[Scan] Vision request sent: ${Math.round(performance.now() - scanStart)}ms`);
      const { data, error } = await supabase.functions.invoke("identify-food", {
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

      const foodResult = data as FoodResult;
      setResult(foodResult);
      setAppState("result");
      markFinalRender();

      // Non-blocking save with image
      queueMicrotask(() => {
        saveMeal({
          items: foodResult.items,
          totalCalories: foodResult.totalCalories,
          confidenceScore: foodResult.confidenceScore,
          macros: foodResult.macros,
          source,
          imageData: compressedImage, // Pass gallery image for thumbnail
        }).catch(() => setSaveError("Could not save meal to device."));
      });
    } catch (err) {
      clearTimeout(timer3s);
      clearTimeout(timer6s);
      resetMetrics();
      setErrorMessage(err instanceof Error ? err.message : "Failed to identify food");
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
    setAdjustedCalories(null);
    setPortionAdjustment(null);
    setAppState("camera");
    restartCamera();
  };

  // Handle portion adjustment
  const handlePortionAdjust = (newCalories: number, adjustment: PortionAdjustment) => {
    setAdjustedCalories(newCalories);
    setPortionAdjustment(adjustment);
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

  // Stop live scanning
  const handleStopLiveScan = () => {
    stopLiveScan();
    setAppState("camera");
  };

  // Start barcode scanning
  const handleStartBarcodeScan = () => {
    setScanSource("barcode");
    setAppState("barcodeScan");
  };

  // Stop barcode scanning
  const handleStopBarcodeScan = () => {
    setBarcodeProduct(null);
    setScannedBarcode("");
    setAppState("camera");
  };

  // Handle barcode product found
  const handleBarcodeProductFound = (product: BarcodeProduct, barcode: string) => {
    setBarcodeProduct(product);
    setScannedBarcode(barcode);
    setAppState("barcodeResult");
  };

  // Add barcode product to meals
  const handleAddBarcodeToMeals = async () => {
    if (!barcodeProduct) return;

    const calories = barcodeProduct.calories || barcodeProduct.caloriesPer100g;
    
    const saved = await saveMeal({
      items: [{
        name: barcodeProduct.name,
        portion: "medium",
        estimatedCalories: calories ? Math.round(calories) : null,
      }],
      totalCalories: calories ? Math.round(calories) : null,
      confidenceScore: 100, // Database lookup is reliable
      macros: barcodeProduct.macros,
      source: "camera",
    });

    if (saved) {
      toast.success("Added to My Meals");
      handleStopBarcodeScan();
    } else {
      toast.error("Could not save meal");
    }
  };

  // Lock live scan result and save it
  const handleLockResult = () => {
    const lockedResult = lockResult();
    if (lockedResult) {
      const newScanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setScanId(newScanId);
      
      const frame = captureImage();
      if (frame) {
        setCapturedImage(frame);
      }
      
      const foodResult: FoodResult = {
        foodDetected: lockedResult.foodDetected,
        items: lockedResult.items,
        totalCalories: lockedResult.totalCalories,
        calorieRange: null, // Live scan doesn't provide range
        confidenceScore: lockedResult.confidenceScore,
        confidence: lockedResult.confidence,
        reasoning: lockedResult.reasoning,
        macros: lockedResult.macros,
        plateType: lockedResult.items.length >= 3 ? "mixed_dish" : lockedResult.items.length === 1 ? "single_item" : "half_plate",
        disclaimer: lockedResult.disclaimer,
        identifiedAt: lockedResult.identifiedAt,
      };
      
      setResult(foodResult);
      stopLiveScan();
      stopCamera();
      setAppState("result");
      
      // Save meal asynchronously with captured frame
      queueMicrotask(() => {
        saveMeal({
          items: lockedResult.items,
          totalCalories: lockedResult.totalCalories,
          confidenceScore: lockedResult.confidenceScore,
          macros: lockedResult.macros,
          source: "camera",
          imageData: frame || undefined, // Pass live scan frame for thumbnail
        }).then((saved) => {
          if (!saved) {
            setSaveError("Could not save meal to device.");
          }
        }).catch(() => {
          setSaveError("Could not save meal to device.");
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

  // Camera view (includes barcode scanning)
  if (appState === "camera" || appState === "liveScan" || appState === "barcodeScan") {
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

          {/* My Meals button - top right */}
          {appState === "camera" && (
            <button
              onClick={() => navigate("/meals")}
              className="absolute top-5 right-5 z-10 p-3 glass-card rounded-xl"
              aria-label="My Meals"
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
            <div className="flex justify-center gap-3 mb-5">
              <button
                onClick={handleStartLiveScan}
                disabled={!!cameraError}
                className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Radio className="h-4 w-4 text-primary" />
                Live
              </button>
              <button
                onClick={handleStartBarcodeScan}
                disabled={!!cameraError}
                className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                <ScanBarcode className="h-4 w-4 text-primary" />
                Barcode
              </button>
              <button
                onClick={openGalleryPicker}
                className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl text-sm font-medium transition-colors hover:bg-muted"
              >
                <Image className="h-4 w-4 text-primary" />
                Upload
              </button>
            </div>
            
            {/* Main scan button */}
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
          <LiveFoodOverlay
            liveResult={liveResult}
            scanStatus={scanStatus}
            isMotionDetected={isMotionDetected}
            onLock={handleLockResult}
            onStop={handleStopLiveScan}
            onRescan={rescan}
          />
        )}

        {/* Barcode scanner overlay */}
        {appState === "barcodeScan" && (
          <BarcodeScannerView
            videoRef={videoRef}
            onProductFound={handleBarcodeProductFound}
            onClose={handleStopBarcodeScan}
          />
        )}
      </div>
    );
  }

  // Barcode result view
  if (appState === "barcodeResult" && barcodeProduct) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        <BarcodeResultCard
          product={barcodeProduct}
          barcode={scannedBarcode}
          onAddToMeals={handleAddBarcodeToMeals}
          onScanAgain={handleStopBarcodeScan}
        />
      </div>
    );
  }

  // Processing state with skeleton
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

  // Result view
  if (appState === "result" && result) {
    const hasFood = result.foodDetected && result.items.length > 0;
    
    const mealSummary = hasFood
      ? result.items.map(i => i.name).slice(0, 3).join(", ")
      : "No food detected";

    // Calculate displayed calories (original or adjusted)
    const getDisplayCalories = (): number | { min: number; max: number } | null => {
      if (adjustedCalories !== null && Number.isFinite(adjustedCalories)) {
        return adjustedCalories;
      }
      return result.totalCalories;
    };

    // Get original calorie value for adjustment calculations
    const getOriginalCalorieValue = (): number => {
      return getCalorieValue(result.totalCalories);
    };

    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        {/* Header with info button */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => navigate("/how-it-works")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="How it works"
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Captured image with rounded corners */}
        {capturedImage && (
          <div className="mb-5 rounded-2xl overflow-hidden soft-border">
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Captured"
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* Result card */}
        <div className="result-card p-6 mb-5 animate-fade-in">
          {hasFood ? (
            <>
              {/* Meal summary */}
              <div className="text-center mb-6">
                <span className="inline-block text-xs text-primary mb-2 font-medium">
                  {result.items.length} item{result.items.length > 1 ? "s" : ""} found
                </span>
                <h1 className="text-xl font-bold tracking-tight">
                  {mealSummary}
                  {result.items.length > 3 && ` +${result.items.length - 3}`}
                </h1>
              </div>

              {/* Meal tone badge */}
              {hasValidCalories(result.totalCalories) && (
                <div className="flex justify-center mb-4">
                  <MealToneBadge calories={getCalorieValue(result.totalCalories)} compact />
                </div>
              )}

              {/* Calorie meter - Hero */}
              <div className="flex justify-center mb-6">
                <CalorieMeter calories={getDisplayCalories()} size="lg" />
              </div>

              {/* Portion feedback - simple question */}
              {result.totalCalories !== null && (
                <div className="mb-5">
                  <PortionFeedback
                    originalCalories={getOriginalCalorieValue()}
                    onAdjust={handlePortionAdjust}
                  />
                </div>
              )}

              {/* Macros if available */}
              {result.macros && (
                <div className="mb-6">
                  <MacrosBadge macros={result.macros} />
                </div>
              )}

              {/* Confidence badge */}
              <div className="flex justify-center mb-5">
                <ConfidenceBadge score={result.confidenceScore} />
              </div>

              {/* Section divider */}
              <div className="section-divider" />

              {/* Food items list */}
              <div className="my-5">
                <FoodItemsList items={result.items} />
              </div>

              {/* Section divider */}
              <div className="section-divider" />

              {/* General Feedback - now that portion is handled above */}
              <div className="mt-4">
                <MealFeedback
                  scanId={scanId}
                  items={result.items}
                  totalCalories={getDisplayCalories()}
                  confidenceScore={result.confidenceScore}
                />
              </div>

              {/* Save error */}
              {(saveError || storageError) && (
                <div className="mt-4 p-3 glass-card rounded-lg">
                  <p className="text-xs text-warning text-center">{saveError || storageError}</p>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground/60 text-center mt-5">
                AI-based estimate. Not medical advice.
              </p>

              {/* Reasoning - collapsible */}
              {result.reasoning && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer text-muted-foreground hover:text-primary transition-colors text-center">
                    How we estimated this
                  </summary>
                  <div className="mt-3 p-3 glass-card rounded-xl text-sm">
                    <p className="text-muted-foreground">{result.reasoning}</p>
                  </div>
                </details>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🍽️</div>
              <h2 className="text-xl font-semibold mb-2">No food detected</h2>
              <p className="text-muted-foreground text-sm">
                Try a clearer photo of your meal
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/meals")}
            className="flex-1 py-4 btn-secondary rounded-xl flex items-center justify-center gap-2 font-medium"
          >
            <History className="h-4 w-4" />
            My Meals
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
