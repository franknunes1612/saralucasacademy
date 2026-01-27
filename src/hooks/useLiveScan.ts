import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Assisted live scanning - triggers AI only when camera is stable.
 * Motion detection prevents continuous API calls.
 */

const MIN_SCAN_INTERVAL_MS = 1500;
const MOTION_THRESHOLD = 15; // Pixel difference threshold (0-255 scale)
const STABILITY_FRAMES = 3; // Frames of stability before scanning
const MOTION_CHECK_INTERVAL = 200; // Check motion every 200ms
const MAX_LIVE_FRAME_WIDTH = 768;
const JPEG_QUALITY = 0.65;

export interface LiveScanResult {
  vehicleType: "car" | "motorcycle" | "unknown";
  make: string | null;
  model: string | null;
  year: number | null;
  spotScore: number | null;
  confidenceScore: number | null;
  confidence: "high" | "medium" | "low" | null;
  reasoning: string | null;
  disclaimer: string;
  identifiedAt: string;
  similarModels?: string[] | null;
}

interface UseLiveScanReturn {
  isLiveScanning: boolean;
  liveResult: LiveScanResult | null;
  scanStatus: "waiting" | "scanning" | "locked";
  isMotionDetected: boolean;
  startLiveScan: () => void;
  stopLiveScan: () => void;
  lockResult: () => LiveScanResult | null;
  rescan: () => void;
  captureFrame: () => string | null;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

/**
 * Capture a small frame for motion detection (very low res)
 */
function captureMotionFrame(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): ImageData | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  // Use tiny resolution for motion detection (fast)
  const width = 64;
  const height = 48;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
  
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Compare two frames and return average pixel difference
 */
function compareFrames(frame1: ImageData, frame2: ImageData): number {
  const data1 = frame1.data;
  const data2 = frame2.data;
  let totalDiff = 0;
  const pixelCount = data1.length / 4;

  for (let i = 0; i < data1.length; i += 4) {
    // Compare grayscale values (faster than RGB)
    const gray1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3;
    const gray2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3;
    totalDiff += Math.abs(gray1 - gray2);
  }

  return totalDiff / pixelCount;
}

/**
 * Resize frame for API call
 */
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

export function useLiveScan(): UseLiveScanReturn {
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveScanResult | null>(null);
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

  // Run a single scan
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
      const { data, error } = await supabase.functions.invoke("identify-car", {
        body: { image: frame },
      });

      if (error) {
        console.log("[LiveScan] API error:", error.message);
        setScanStatus("waiting");
        isProcessingRef.current = false;
        return;
      }

      if (data?.error) {
        console.log("[LiveScan] Response error:", data.error);
        setScanStatus("waiting");
        isProcessingRef.current = false;
        return;
      }

      const result = data as LiveScanResult;
      setLiveResult(result);
      setScanStatus("locked");
    } catch (err) {
      console.error("[LiveScan] Error:", err);
      setScanStatus("waiting");
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Motion detection loop
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
      // Camera is moving - reset stability counter
      stableCountRef.current = 0;
      
      // If we had a locked result and camera moves significantly, unlock
      if (scanStatus === "locked" && motionLevel > MOTION_THRESHOLD * 2) {
        setScanStatus("waiting");
        hasScanTriggeredRef.current = false;
      }
    } else {
      // Camera is stable
      stableCountRef.current++;

      // If stable for enough frames and we haven't scanned yet, trigger scan
      if (
        stableCountRef.current >= STABILITY_FRAMES &&
        scanStatus === "waiting" &&
        !hasScanTriggeredRef.current
      ) {
        runScan();
      }
    }
  }, [scanStatus, runScan]);

  // Manual rescan
  const rescan = useCallback(() => {
    if (isProcessingRef.current) return;
    
    hasScanTriggeredRef.current = false;
    setScanStatus("waiting");
    stableCountRef.current = STABILITY_FRAMES; // Trigger immediate scan
    runScan();
  }, [runScan]);

  const startLiveScan = useCallback(() => {
    if (isLiveScanning) return;

    // Create motion detection canvas
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

    // Start motion detection loop
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

  const lockResult = useCallback((): LiveScanResult | null => {
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
    setScanStatus("locked");
    return liveResult;
  }, [liveResult]);

  // Cleanup on unmount
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
