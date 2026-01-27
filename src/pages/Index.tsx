import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSavedMeals, FoodItem } from "@/hooks/useSavedMeals";
import { useLiveFoodScan, LiveFoodResult } from "@/hooks/useLiveFoodScan";
import { useAuth } from "@/hooks/useAuth";
import { usePortionLearning } from "@/hooks/usePortionLearning";
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
import { PortionSlider } from "@/components/PortionSlider";
import { MealToneBadge } from "@/components/MealToneBadge";
import { ZeroCalorieBadge, ZeroMacrosBadge } from "@/components/ZeroCalorieBadge";
import { EstimationLabel, EstimationType } from "@/components/EstimationLabel";
import { Onboarding } from "@/components/Onboarding";

import { RecipeSuggestions } from "@/components/RecipeSuggestions";
import { History, Radio, Image, ScanBarcode, HelpCircle, Settings, Sparkles } from "lucide-react";
import { preprocessImage, getBase64SizeKB } from "@/lib/imageProcessor";
import { toast } from "sonner";
import { safeNumber, getCalorieValue, hasValidCalories, isZeroCalorieResult, hasCalorieData, ensureMacros } from "@/lib/nutritionUtils";
import {
  startScanMetrics,
  markUIResponse,
  markPreprocessComplete,
  markAIResponse,
  markFinalRender,
  resetMetrics,
} from "@/lib/performanceLogger";

// Session-based onboarding key - resets on app close, persists during navigation
const ONBOARDING_SESSION_KEY = "caloriespot_onboarding_session";

// Stabilization delay for iOS/Safari camera initialization (ms)
const CAMERA_STABILIZATION_DELAY = 300;

// Hard timeout for camera initialization (ms) - failsafe to prevent infinite loading
const CAMERA_INIT_TIMEOUT = 5000;

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

// Camera view is now shown during initialization to ensure DOM is ready
type AppState = "splash" | "onboarding" | "permissionDenied" | "camera" | "liveScan" | "barcodeScan" | "barcodeResult" | "processing" | "result" | "error";

type CameraLifecycle = "idle" | "checking_permissions" | "waiting_for_dom" | "requesting_stream" | "ready" | "error";

interface BarcodeProduct {
  name: string;
  brand: string | null;
  servingSize: string | null;
  calories: number | null;
  caloriesPer100g: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  imageUrl: string | null;
}

// Check if onboarding was completed THIS SESSION (not across app reopens)
const getInitialAppState = (): AppState => {
  try {
    // Use sessionStorage: persists during page navigation, clears on app close/reopen
    if (sessionStorage.getItem(ONBOARDING_SESSION_KEY) === "true") {
      return "camera"; // Go directly to camera view (lifecycle handles initialization)
    }
  } catch {
    // sessionStorage not available
  }
  // Always start with splash on fresh app load
  return "splash";
};

// Get initial camera lifecycle based on app state
const getInitialCameraLifecycle = (): CameraLifecycle => {
  try {
    if (sessionStorage.getItem(ONBOARDING_SESSION_KEY) === "true") {
      return "checking_permissions"; // Start permission check immediately
    }
  } catch {
    // sessionStorage not available
  }
  return "idle";
};

export default function Index() {
  const navigate = useNavigate();
  const { saveMeal, storageError } = useSavedMeals();
  const { isAdmin } = useAuth();
  
  const [appState, setAppState] = useState<AppState>(getInitialAppState);
  const [cameraLifecycle, setCameraLifecycle] = useState<CameraLifecycle>(getInitialCameraLifecycle);
  const [result, setResult] = useState<FoodResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Scanning…");
  const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [sliderAdjustment, setSliderAdjustment] = useState<{
    grams: number;
    calories: number;
    macros: { protein: number; carbs: number; fat: number } | null;
    multiplier: number;
  } | null>(null);
  
  // Portion learning hook
  const { recordAdjustment } = usePortionLearning();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanSource, setScanSource] = useState<"camera" | "gallery" | "barcode">("camera");
  const initializingRef = useRef(false); // Prevent duplicate initialization
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Hard timeout failsafe
  const abortControllerRef = useRef<AbortController | null>(null); // Cancel stale requests

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

  // Handle splash complete - go to onboarding
  const handleSplashComplete = useCallback(() => {
    setAppState("onboarding");
  }, []);

  // Handle onboarding complete - persist in sessionStorage and go to camera
  const handleOnboardingComplete = useCallback(() => {
    try {
      // Use sessionStorage so it persists during navigation but resets on app close
      sessionStorage.setItem(ONBOARDING_SESSION_KEY, "true");
    } catch {
      // Ignore storage errors
    }
    // Go to camera view, lifecycle will handle initialization
    setAppState("camera");
    setCameraLifecycle("checking_permissions");
  }, []);

  // Attach stream to video element safely
  const attachStreamToVideo = useCallback(async (stream: MediaStream): Promise<boolean> => {
    // Wait for video element to be available
    const waitForVideo = (): Promise<HTMLVideoElement | null> => {
      return new Promise((resolve) => {
        if (videoRef.current) {
          resolve(videoRef.current);
          return;
        }
        // Wait a frame for React to mount
        requestAnimationFrame(() => {
          if (videoRef.current) {
            resolve(videoRef.current);
          } else {
            // One more attempt after a short delay
            setTimeout(() => resolve(videoRef.current), 100);
          }
        });
      });
    };

    const video = await waitForVideo();
    if (!video) {
      console.warn("[Camera] Video element not available");
      return false;
    }

    try {
      // Defensive: ensure stream is valid and not aborted
      if (!stream || !stream.active) {
        console.warn("[Camera] Stream is not active");
        return false;
      }

      video.srcObject = stream;
      await video.play();
      return true;
    } catch (err) {
      // Ignore AbortError - user navigated away or cancelled
      if (err instanceof Error && err.name === "AbortError") {
        console.log("[Camera] Stream attachment aborted (user action)");
        return false;
      }
      console.error("[Camera] Error attaching stream:", err);
      return false;
    }
  }, []);

  // Clean up any pending initialization
  const cleanupInitialization = useCallback(() => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    initializingRef.current = false;
  }, []);

  // Main camera initialization function
  const initializeCamera = useCallback(async () => {
    // Prevent duplicate initialization
    if (initializingRef.current) {
      console.log("[Camera] Already initializing, skipping");
      return;
    }
    
    initializingRef.current = true;
    cleanupInitialization();
    
    // Create new abort controller for this initialization attempt
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // Set up hard timeout failsafe
    initTimeoutRef.current = setTimeout(() => {
      if (initializingRef.current) {
        console.log("[Camera] Initialization timed out");
        initializingRef.current = false;
        setCameraLifecycle("error");
        setCameraError("Camera took too long to start. Please tap Retry.");
      }
    }, CAMERA_INIT_TIMEOUT);
    
    setCameraLifecycle("checking_permissions");
    setCameraError(null);
    
    try {
      // Check if aborted before proceeding
      if (signal.aborted) return;
      
      // Step 1: Check permission status if API is available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.log("[Camera] Permission status:", permissionStatus.state);
          
          if (signal.aborted) return;
          
          if (permissionStatus.state === "denied") {
            cleanupInitialization();
            setCameraLifecycle("error");
            setAppState("permissionDenied");
            return;
          }
        } catch (permErr) {
          // Some browsers don't support camera permission query, continue anyway
          console.log("[Camera] Permission query not supported, proceeding");
        }
      }
      
      if (signal.aborted) return;
      
      // Step 2: Wait for DOM stabilization (critical for iOS/Safari)
      setCameraLifecycle("waiting_for_dom");
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, CAMERA_STABILIZATION_DELAY);
        });
      });
      
      if (signal.aborted) return;
      
      // Step 3: Request camera stream
      setCameraLifecycle("requesting_stream");
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (signal.aborted) {
        // Clean up stream if we were aborted
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      
      // Validate stream
      if (!stream || stream.getTracks().length === 0) {
        throw new Error("No camera stream available");
      }
      
      streamRef.current = stream;
      
      // Small delay before attaching to video
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (signal.aborted) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      
      // Step 4: Attach stream to video element
      const attached = await attachStreamToVideo(stream);
      
      if (signal.aborted) return;
      
      if (!attached) {
        throw new Error("Could not display camera feed");
      }
      
      // Success!
      cleanupInitialization();
      initializingRef.current = false;
      setCameraLifecycle("ready");
      console.log("[Camera] Ready");
      
    } catch (err) {
      if (signal.aborted) return;
      
      console.log("[Camera] Error:", err);
      cleanupInitialization();
      initializingRef.current = false;
      
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorName = err instanceof Error && 'name' in err ? (err as any).name : "";
      
      // Check if it's a permission error
      const isPermissionError = 
        errorName === "NotAllowedError" ||
        errorName === "PermissionDeniedError" ||
        errorMsg.includes("Permission") || 
        errorMsg.includes("denied") ||
        errorMsg.includes("not allowed");
      
      if (isPermissionError) {
        setCameraLifecycle("error");
        setAppState("permissionDenied");
      } else {
        // For other errors, show retry option
        setCameraLifecycle("error");
        setCameraError("Camera unavailable. Tap Retry or use Upload.");
      }
    }
  }, [attachStreamToVideo, cleanupInitialization]);

  // Effect to start camera initialization when entering camera state
  useEffect(() => {
    if (appState === "camera" && cameraLifecycle === "checking_permissions" && !initializingRef.current) {
      initializeCamera();
    }
  }, [appState, cameraLifecycle, initializeCamera]);

  // Retry camera permission/initialization
  const handleRetryPermission = useCallback(() => {
    cleanupInitialization();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraError(null);
    setCameraLifecycle("checking_permissions");
    // initializeCamera will be triggered by the effect
  }, [cleanupInitialization]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupInitialization();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [cleanupInitialization]);

  // Restart camera - uses the same unified initialization flow
  const restartCamera = useCallback(() => {
    handleRetryPermission();
  }, [handleRetryPermission]);

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
    setSliderAdjustment(null);
    setAppState("camera");
    restartCamera();
  };

  // Handle portion slider adjustment with learning
  const handleSliderAdjust = useCallback((adjusted: {
    grams: number;
    calories: number;
    macros: { protein: number; carbs: number; fat: number } | null;
    multiplier: number;
  }) => {
    setSliderAdjustment(adjusted);
    
    // Record for learning (only significant adjustments)
    if (result && result.items.length > 0) {
      const category = result.items[0].name || "unknown";
      recordAdjustment(category, getEstimatedGrams(), adjusted.grams, adjusted.multiplier);
    }
  }, [result, recordAdjustment]);

  // Estimate grams based on plate type and portion
  const getEstimatedGrams = useCallback((): number => {
    if (!result) return 150;
    
    const portionMultipliers: Record<string, number> = {
      small: 0.7,
      medium: 1.0,
      large: 1.4,
    };
    
    const plateBaseGrams: Record<PlateType, number> = {
      single_item: 120,
      half_plate: 200,
      full_plate: 350,
      mixed_dish: 300,
      bowl: 280,
      snack: 80,
    };
    
    const baseGrams = plateBaseGrams[result.plateType] || 200;
    const dominantPortion = result.items.length > 0 ? result.items[0].portion : "medium";
    const multiplier = portionMultipliers[dominantPortion] || 1.0;
    
    return Math.round(baseGrams * multiplier);
  }, [result]);

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

  // Onboarding screen
  if (appState === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Permission denied screen
  if (appState === "permissionDenied") {
    return <PermissionDenied onRetry={handleRetryPermission} />;
  }

  // Camera view (includes barcode scanning and initialization states)
  if (appState === "camera" || appState === "liveScan" || appState === "barcodeScan") {
    // Show loading overlay when camera is initializing (but keep video element mounted!)
    const isInitializing = cameraLifecycle === "checking_permissions" || 
                           cameraLifecycle === "waiting_for_dom" || 
                           cameraLifecycle === "requesting_stream";
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Camera viewport with scan frame */}
        <div className="flex-1 relative scan-frame scan-frame-bottom">
          {/* Always render video element to ensure DOM is ready */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Show error overlay with retry + upload options */}
          {cameraError && cameraLifecycle === "error" && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/95">
              <div className="text-center max-w-xs">
                <p className="text-destructive mb-6">{cameraError}</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={restartCamera} 
                    className="w-full btn-primary px-6 py-3 rounded-xl font-medium"
                  >
                    Retry Camera
                  </button>
                  <button 
                    onClick={openGalleryPicker} 
                    className="w-full px-6 py-3 rounded-xl font-medium bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Upload Photo Instead
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Show loading overlay during initialization (video stays mounted underneath) */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Setting up camera...</h2>
                <p className="text-sm text-muted-foreground">Please allow camera access when prompted</p>
              </div>
            </div>
          )}

          {/* Header - app title and action buttons */}
          {appState === "camera" && !isInitializing && (
            <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-white drop-shadow-lg tracking-tight">
                CalorieSpot
              </h1>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin/recipes")}
                    className="p-3 glass-card rounded-xl"
                    aria-label="Manage Recipes"
                  >
                    <Settings className="h-5 w-5 text-white" />
                  </button>
                )}
                <button
                  onClick={() => navigate("/premium")}
                  className="p-3 glass-card rounded-xl"
                  aria-label="Premium features"
                >
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </button>
                <button
                  onClick={() => navigate("/meals")}
                  className="p-3 glass-card rounded-xl"
                  aria-label="My Meals"
                >
                  <History className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
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
        {appState === "camera" && !isInitializing && (
          <div className="p-6 bg-card/90 backdrop-blur-lg border-t border-white/10">

            {/* Secondary actions */}
            <div className="flex justify-center gap-3 mb-5">
              <button
                onClick={handleStartLiveScan}
                disabled={cameraLifecycle !== "ready"}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl text-sm font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-50"
              >
                <Radio className="h-4 w-4" />
                Live
              </button>
              <button
                onClick={handleStartBarcodeScan}
                disabled={cameraLifecycle !== "ready"}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl text-sm font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-50"
              >
                <ScanBarcode className="h-4 w-4" />
                Barcode
              </button>
              <button
                onClick={openGalleryPicker}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur rounded-xl text-sm font-medium text-white transition-colors hover:bg-white/25"
              >
                <Image className="h-4 w-4" />
                Upload
              </button>
            </div>
            
            {/* Main scan button */}
            <div className="flex justify-center">
              <button
                onClick={handleCapture}
                disabled={cameraLifecycle !== "ready"}
                className="scan-button w-20 h-20 disabled:opacity-40 flex items-center justify-center"
                aria-label="Scan"
              >
                <div className="w-6 h-6 rounded-full bg-primary" />
              </button>
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

    // Calculate displayed calories (original or slider-adjusted)
    const getDisplayCalories = (): number | { min: number; max: number } | null => {
      if (sliderAdjustment !== null && Number.isFinite(sliderAdjustment.calories)) {
        return sliderAdjustment.calories;
      }
      return result.totalCalories;
    };

    // Get display macros (original or slider-adjusted)
    const getDisplayMacros = () => {
      if (sliderAdjustment?.macros) {
        return sliderAdjustment.macros;
      }
      return ensureMacros(result.macros, result.totalCalories);
    };

    // Get original calorie value for slider base
    const getOriginalCalorieValue = (): number => {
      return getCalorieValue(result.totalCalories);
    };

    // Determine estimation type for label
    const getEstimationType = (): EstimationType => {
      if (sliderAdjustment && Math.abs(sliderAdjustment.multiplier - 1.0) > 0.05) {
        return "user_adjusted";
      }
      return "visual";
    };

    // Check if low confidence (show slider more prominently)
    const isLowConfidence = safeNumber(result.confidenceScore, 70) < 70;

    return (
      <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
        {/* Header with app title, premium, and info button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            CalorieSpot
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate("/premium")}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Premium features"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </button>
            <button
              onClick={() => navigate("/how-it-works")}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="How it works"
            >
              <HelpCircle className="h-5 w-5 text-white/70" />
            </button>
          </div>
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
                <span className="inline-block text-xs text-white/80 mb-2 font-medium">
                  {result.items.length} item{result.items.length > 1 ? "s" : ""} found
                </span>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {mealSummary}
                  {result.items.length > 3 && ` +${result.items.length - 3}`}
                </h1>
              </div>

              {/* Meal tone badge - hide for zero-calorie items */}
              {hasValidCalories(result.totalCalories) && !isZeroCalorieResult(result.totalCalories) && (
                <div className="flex justify-center mb-4">
                  <MealToneBadge calories={getCalorieValue(result.totalCalories)} compact />
                </div>
              )}

              {/* Zero-calorie badge OR Calorie meter */}
              {isZeroCalorieResult(result.totalCalories) ? (
                <div className="flex flex-col items-center gap-4 mb-6">
                  <ZeroCalorieBadge showSubtitle />
                  <ZeroMacrosBadge />
                </div>
              ) : (
                <>
                  {/* Calorie meter - Hero */}
                  <div className="flex justify-center mb-6">
                    <CalorieMeter calories={getDisplayCalories()} size="lg" />
                  </div>

                  {/* Portion slider with gram estimate */}
                  {result.totalCalories !== null && hasValidCalories(result.totalCalories) && (
                    <div className="mb-5">
                      <PortionSlider
                        baseGrams={getEstimatedGrams()}
                        baseCalories={getOriginalCalorieValue()}
                        baseMacros={ensureMacros(result.macros, result.totalCalories)}
                        onAdjust={handleSliderAdjust}
                        lowConfidence={isLowConfidence}
                      />
                    </div>
                  )}

                  {/* Macros - updated with slider adjustment */}
                  {hasValidCalories(result.totalCalories) && (
                    <div className="mb-5">
                      <MacrosBadge macros={getDisplayMacros()} />
                    </div>
                  )}
                </>
              )}

              {/* Estimation type label */}
              {!isZeroCalorieResult(result.totalCalories) && (
                <div className="flex justify-center mb-4">
                  <EstimationLabel type={getEstimationType()} />
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
              <p className="text-xs text-white/50 text-center mt-5">
                AI-based estimate. Not medical advice.
              </p>

              {/* Reasoning - collapsible */}
              {result.reasoning && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer text-white/60 hover:text-white transition-colors text-center">
                    How we estimated this
                  </summary>
                  <div className="mt-3 p-3 bg-white/10 rounded-xl text-sm">
                    <p className="text-white/80">{result.reasoning}</p>
                  </div>
                </details>
              )}

              {/* Section divider */}
              <div className="section-divider mt-6" />

              {/* Recipe Suggestions based on meal tone */}
              {hasValidCalories(result.totalCalories) && (
                <div className="mt-5">
                  <RecipeSuggestions
                    mealTone={
                      getCalorieValue(result.totalCalories) < 300 ? "light" :
                      getCalorieValue(result.totalCalories) <= 600 ? "balanced" : "rich"
                    }
                  />
                </div>
              )}

              {/* Premium promotion - subtle */}
              <div className="mt-5">
                <button
                  onClick={() => navigate("/premium")}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 text-left hover:from-primary/30 hover:to-secondary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/30">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Get a personalized plan</p>
                      <p className="text-xs text-white/60">Tailored nutrition &amp; training goals</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Guidance hint */}
              <p className="text-xs text-white/50 text-center mt-5">
                Tap the chat button for personalized nutrition advice
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🍽️</div>
              <h2 className="text-xl font-semibold text-white mb-2">No food detected</h2>
              <p className="text-white/70 text-sm">
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
