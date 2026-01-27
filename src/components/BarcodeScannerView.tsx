import { useEffect, useRef, useState } from "react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ScanBarcode, AlertCircle, Package, X } from "lucide-react";

interface BarcodeProduct {
  name: string;
  brand: string | null;
  servingSize: string | null;
  calories: number | null;
  caloriesPer100g: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
  imageUrl: string | null;
}

interface BarcodeScannerViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onProductFound: (product: BarcodeProduct, barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScannerView({ 
  videoRef, 
  onProductFound, 
  onClose 
}: BarcodeScannerViewProps) {
  const { isScanning, lastBarcode, error, isSupported, startScanning, stopScanning, clearResult } = useBarcodeScanner();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const hasStartedRef = useRef(false);
  const scanningActiveRef = useRef(false);

  // Start scanning when video is ready
  useEffect(() => {
    // Reset on mount
    hasStartedRef.current = false;
    scanningActiveRef.current = true;
    
    const checkAndStartScanning = () => {
      if (!scanningActiveRef.current) return;
      
      if (videoRef.current && videoRef.current.readyState >= 2 && !hasStartedRef.current) {
        hasStartedRef.current = true;
        console.log("[BarcodeScannerView] Starting barcode scan");
        startScanning(videoRef.current);
      } else if (!hasStartedRef.current) {
        // Retry until video is ready
        setTimeout(checkAndStartScanning, 100);
      }
    };
    
    checkAndStartScanning();

    return () => {
      console.log("[BarcodeScannerView] Cleanup - stopping scan");
      scanningActiveRef.current = false;
      hasStartedRef.current = false;
      stopScanning();
      clearResult();
    };
  }, [videoRef, startScanning, stopScanning, clearResult]);

  // Look up barcode when detected
  useEffect(() => {
    if (!lastBarcode) return;

    const lookupProduct = async () => {
      setIsLookingUp(true);
      setLookupError(null);
      setNotFound(false);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("lookup-barcode", {
          body: { barcode: lastBarcode.barcode },
        });

        if (fnError) {
          throw fnError;
        }

        if (data.found && data.product) {
          onProductFound(data.product, lastBarcode.barcode);
        } else {
          setNotFound(true);
          // Clear after delay to allow retry
          setTimeout(() => {
            clearResult();
            setNotFound(false);
          }, 3000);
        }
      } catch (err) {
        console.error("[BarcodeLookup] Error:", err);
        setLookupError("Failed to look up product");
        setTimeout(() => {
          clearResult();
          setLookupError(null);
        }, 3000);
      } finally {
        setIsLookingUp(false);
      }
    };

    lookupProduct();
  }, [lastBarcode, onProductFound, clearResult]);

  return (
    <div className="absolute inset-0 z-20">
      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Darkened areas */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Clear scanning area */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-40">
          <div className="absolute inset-0 bg-transparent" style={{ 
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" 
          }} />
          
          {/* Scan line animation */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute left-0 right-0 h-0.5 bg-primary animate-scan-line" />
          </div>
          
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-primary rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-primary rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-primary rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-primary rounded-br-lg" />
        </div>
      </div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ScanBarcode className="h-5 w-5" />
            <span className="font-medium">Scan Barcode</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status messages */}
      <div className="absolute bottom-32 left-0 right-0 px-4">
        <div className="glass-card p-4 rounded-xl text-center mx-auto max-w-sm">
          {!isSupported ? (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Barcode scanning not supported on this device.</span>
              <button 
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Use Photo Instead
              </button>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          ) : isLookingUp ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Looking up product...</span>
            </div>
          ) : lookupError ? (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{lookupError}</span>
            </div>
          ) : notFound ? (
            <div className="flex items-center justify-center gap-2 text-warning">
              <Package className="h-5 w-5" />
              <span className="text-sm">Product not found. Try another.</span>
            </div>
          ) : lastBarcode ? (
            <div className="text-sm text-muted-foreground">
              Detected: {lastBarcode.barcode}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Point camera at a barcode
            </div>
          )}
        </div>
      </div>

      {/* Instruction */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <p className="text-xs text-white/70">
          Works with packaged food barcodes (EAN/UPC)
        </p>
      </div>
    </div>
  );
}
