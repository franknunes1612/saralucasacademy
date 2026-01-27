import { useState, useRef, useCallback, useEffect } from "react";

interface BarcodeResult {
  barcode: string;
  format: string;
}

interface UseBarcodeScnnerReturn {
  isScanning: boolean;
  lastBarcode: BarcodeResult | null;
  error: string | null;
  startScanning: (video: HTMLVideoElement) => void;
  stopScanning: () => void;
  clearResult: () => void;
}

// Check if BarcodeDetector is available
const isBarcodeDetectorSupported = "BarcodeDetector" in window;

export function useBarcodeScanner(): UseBarcodeScnnerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const cooldownRef = useRef<boolean>(false);

  // Initialize detector
  useEffect(() => {
    if (isBarcodeDetectorSupported) {
      try {
        detectorRef.current = new BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
        });
      } catch (err) {
        console.error("[BarcodeScanner] Failed to initialize:", err);
        setError("Barcode scanner not available");
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const scanFrame = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || cooldownRef.current) {
      if (isScanning) {
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
      // Detection errors are normal during scanning
    }

    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [isScanning]);

  const startScanning = useCallback((video: HTMLVideoElement) => {
    if (!isBarcodeDetectorSupported) {
      setError("Barcode scanning not supported on this device. Try using Chrome on Android.");
      return;
    }

    videoRef.current = video;
    setIsScanning(true);
    setError(null);
    lastScannedRef.current = null;
    
    // Start scanning loop
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [scanFrame]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
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
    startScanning,
    stopScanning,
    clearResult,
  };
}

// Type declaration for BarcodeDetector
declare global {
  interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  }
  
  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    rawValue: string;
    format: string;
    cornerPoints: { x: number; y: number }[];
  }
  
  interface BarcodeDetectorOptions {
    formats: string[];
  }
  
  var BarcodeDetector: {
    prototype: BarcodeDetector;
    new(options?: BarcodeDetectorOptions): BarcodeDetector;
    getSupportedFormats(): Promise<string[]>;
  };
}
