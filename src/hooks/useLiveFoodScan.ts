import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Assisted live scanning for food - triggers AI only when camera is stable.
 * Motion detection prevents continuous API calls.
 */

const MIN_SCAN_INTERVAL_MS = 2000;
const MOTION_THRESHOLD = 15;
const STABILITY_FRAMES = 3;
const MOTION_CHECK_INTERVAL = 200;
const MAX_LIVE_FRAME_WIDTH = 768;
const JPEG_QUALITY = 0.65;

export interface FoodItem {
  name: string;
  portion: "small" | "medium" | "large";
  estimatedCalories: number | null;
}

export interface LiveFoodResult {
  foodDetected: boolean;
  items: FoodItem[];
  totalCalories: number | { min: number; max: number } | null;
  confidenceScore: number | null;
  confidence: "high" | "medium" | "low" | null;
  reasoning: string | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  disclaimer: string;
  identifiedAt: string;
}

interface UseLiveFoodScanReturn {
  isLiveScanning: boolean;
  liveResult: LiveFoodResult | null;
  scanStatus: "waiting" | "scanning" | "locked";
  isMotionDetected: boolean;
  startLiveScan: () => void;
  stopLiveScan: () => void;
  lockResult: () => LiveFoodResult | null;
  rescan: () => void;
  captureFrame: () => string | null;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

function captureMotionFrame(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): ImageData | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const width = 64;
  const height = 48;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
  
  return ctx.getImageData(0, 0, width, height);
}

function compareFrames(frame1: ImageData, frame2: ImageData): number {
  const data1 = frame1.data;
  const data2 = frame2.data;
  let totalDiff = 0;
  const pixelCount = data1.length / 4;

  for (let i = 0; i < data1.length; i += 4) {
    const gray1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3;
    const gray2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3;
    totalDiff += Math.abs(gray1 - gray2);
  }

  return totalDiff / pixelCount;
}

function resizeFrameForScan(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let width = video.videoWidth;
  let height = video.videoHeight;
  
  if (width > MAX_LIVE_FRAME_WIDTH) {
    const ratio = MAX_LIVE_FRAME_WIDTH / width;
    width = MAX_LIVE_FRAME_WIDTH;
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
  
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
}

export function useLiveFoodScan(): UseLiveFoodScanReturn {
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveFoodResult | null>(null);
  const [scanStatus, setScanStatus] = useState<"waiting" | "scanning" | "locked">("waiting");
  const [isMotionDetected, setIsMotionDetected] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionIntervalRef = useRef<number | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const stableCountRef = useRef(0);
  const lastScanTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const hasScanTriggeredRef = useRef(false);

  const setVideoRef = useCallback((ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  }, []);

  const setCanvasRef = useCallback((ref: HTMLCanvasElement | null) => {
    canvasRef.current = ref;
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    return resizeFrameForScan(canvasRef.current, videoRef.current);
  }, []);

  const runScan = useCallback(async () => {
    if (isProcessingRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastScanTimeRef.current < MIN_SCAN_INTERVAL_MS) {
      return;
    }

    const frame = resizeFrameForScan(canvasRef.current, videoRef.current);
    if (!frame) return;

    isProcessingRef.current = true;
    hasScanTriggeredRef.current = true;
    lastScanTimeRef.current = now;
    setScanStatus("scanning");

    try {
      const { data, error } = await supabase.functions.invoke("identify-food", {
        body: { image: frame },
      });

      if (error) {
        console.log("[LiveFoodScan] API error:", error.message);
        setScanStatus("waiting");
        isProcessingRef.current = false;
        return;
      }

      if (data?.error) {
        console.log("[LiveFoodScan] Response error:", data.error);
        setScanStatus("waiting");
        isProcessingRef.current = false;
        return;
      }

      const result = data as LiveFoodResult;
      setLiveResult(result);
      setScanStatus("locked");
    } catch (err) {
      console.error("[LiveFoodScan] Error:", err);
      setScanStatus("waiting");
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const checkMotion = useCallback(() => {
    if (!videoRef.current || !motionCanvasRef.current) return;
    if (scanStatus === "scanning") return;

    const currentFrame = captureMotionFrame(motionCanvasRef.current, videoRef.current);
    if (!currentFrame) return;

    if (!lastFrameRef.current) {
      lastFrameRef.current = currentFrame;
      return;
    }

    const motionLevel = compareFrames(lastFrameRef.current, currentFrame);
    lastFrameRef.current = currentFrame;

    const hasMotion = motionLevel > MOTION_THRESHOLD;
    setIsMotionDetected(hasMotion);

    if (hasMotion) {
      stableCountRef.current = 0;
      
      if (scanStatus === "locked" && motionLevel > MOTION_THRESHOLD * 2) {
        setScanStatus("waiting");
        hasScanTriggeredRef.current = false;
      }
    } else {
      stableCountRef.current++;

      if (
        stableCountRef.current >= STABILITY_FRAMES &&
        scanStatus === "waiting" &&
        !hasScanTriggeredRef.current
      ) {
        runScan();
      }
    }
  }, [scanStatus, runScan]);

  const rescan = useCallback(() => {
    if (isProcessingRef.current) return;
    
    hasScanTriggeredRef.current = false;
    setScanStatus("waiting");
    stableCountRef.current = STABILITY_FRAMES;
    runScan();
  }, [runScan]);

  const startLiveScan = useCallback(() => {
    if (isLiveScanning) return;

    if (!motionCanvasRef.current) {
      motionCanvasRef.current = document.createElement("canvas");
    }

    setIsLiveScanning(true);
    setLiveResult(null);
    setScanStatus("waiting");
    setIsMotionDetected(true);
    stableCountRef.current = 0;
    lastFrameRef.current = null;
    lastScanTimeRef.current = 0;
    isProcessingRef.current = false;
    hasScanTriggeredRef.current = false;

    motionIntervalRef.current = window.setInterval(checkMotion, MOTION_CHECK_INTERVAL);
  }, [isLiveScanning, checkMotion]);

  const stopLiveScan = useCallback(() => {
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
    
    setIsLiveScanning(false);
    setLiveResult(null);
    setScanStatus("waiting");
    setIsMotionDetected(true);
    stableCountRef.current = 0;
    lastFrameRef.current = null;
    isProcessingRef.current = false;
    hasScanTriggeredRef.current = false;
  }, []);

  const lockResult = useCallback((): LiveFoodResult | null => {
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
    setScanStatus("locked");
    return liveResult;
  }, [liveResult]);

  useEffect(() => {
    return () => {
      if (motionIntervalRef.current) {
        clearInterval(motionIntervalRef.current);
      }
    };
  }, []);

  return {
    isLiveScanning,
    liveResult,
    scanStatus,
    isMotionDetected,
    startLiveScan,
    stopLiveScan,
    lockResult,
    rescan,
    captureFrame,
    setVideoRef,
    setCanvasRef,
  };
}
