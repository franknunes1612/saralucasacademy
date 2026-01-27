import { useState, useRef, useCallback, useEffect } from "react";
import { BarcodeDetector as BarcodeDetectorPolyfill } from "barcode-detector/ponyfill";

interface BarcodeResult {
  barcode: string;
  format: string;
}

interface UseBarcodeScnnerReturn {
  isScanning: boolean;
  lastBarcode: BarcodeResult | null;
  error: string | null;
  isSupported: boolean;
  startScanning: (video: HTMLVideoElement) => void;
  stopScanning: () => void;
  clearResult: () => void;
}

// Check if native BarcodeDetector is available
const hasNativeBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

export function useBarcodeScanner(): UseBarcodeScnnerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const detectorRef = useRef<BarcodeDetectorPolyfill | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef<boolean>(false);
  const isScanningRef = useRef<boolean>(false);

  // Initialize detector (use polyfill for cross-platform support including iOS)
  useEffect(() => {
    const initDetector = async () => {
      try {
        // Always use the polyfill for consistent cross-platform behavior
        // It uses WebAssembly ZXing under the hood and works on iOS Safari
        const formats = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] as const;
        
        // Check if formats are supported
        const supportedFormats = await BarcodeDetectorPolyfill.getSupportedFormats();
        const availableFormats = formats.filter(f => supportedFormats.includes(f));
        
        if (availableFormats.length === 0) {
          console.warn("[BarcodeScanner] No supported barcode formats");
          setError("Barcode scanning not supported on this device");
          setIsSupported(false);
          return;
        }
        
        detectorRef.current = new BarcodeDetectorPolyfill({
          formats: availableFormats,
        });
        
        console.log("[BarcodeScanner] Initialized with formats:", availableFormats);
        setIsSupported(true);
      } catch (err) {
        console.error("[BarcodeScanner] Failed to initialize:", err);
        setError("Barcode scanner not available");
        setIsSupported(false);
      }
    };
    
    initDetector();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const scanFrame = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || cooldownRef.current) {
      if (isScanningRef.current) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    // Check if video is ready
    if (videoRef.current.readyState < 2) {
      if (isScanningRef.current) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
      return;
    }

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0];
        
        // Avoid duplicate scans
        if (barcode.rawValue !== lastScannedRef.current) {
          lastScannedRef.current = barcode.rawValue;
          console.log("[BarcodeScanner] Detected:", barcode.rawValue, barcode.format);
          setLastBarcode({
            barcode: barcode.rawValue,
            format: barcode.format,
          });
          
          // Cooldown to prevent rapid re-scans
          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false;
          }, 2000);
        }
      }
    } catch (err) {
      // Detection errors are normal during scanning, just continue
      console.debug("[BarcodeScanner] Frame detection error (normal):", err);
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, []);

  const startScanning = useCallback((video: HTMLVideoElement) => {
    if (!detectorRef.current) {
      setError("Barcode scanner initializing, please wait...");
      // Retry after a short delay
      setTimeout(() => {
        if (detectorRef.current) {
          startScanning(video);
        } else {
          setError("Barcode scanner not available. Please try again.");
        }
      }, 500);
      return;
    }

    videoRef.current = video;
    setIsScanning(true);
    isScanningRef.current = true;
    setError(null);
    lastScannedRef.current = null;
    
    console.log("[BarcodeScanner] Starting scan loop");
    
    // Start scanning loop
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [scanFrame]);

  const stopScanning = useCallback(() => {
    console.log("[BarcodeScanner] Stopping scan");
    setIsScanning(false);
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const clearResult = useCallback(() => {
    setLastBarcode(null);
    lastScannedRef.current = null;
  }, []);

  return {
    isScanning,
    lastBarcode,
    error,
    isSupported,
    startScanning,
    stopScanning,
    clearResult,
  };
}
