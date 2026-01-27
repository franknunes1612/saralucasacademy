import { useEffect, useRef, useState } from "react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ScanBarcode, AlertCircle, Package, X, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";

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

// Barcode validation schema
const barcodeSchema = z.string()
  .trim()
  .min(8, "Barcode must be at least 8 digits")
  .max(14, "Barcode must be at most 14 digits")
  .regex(/^\d+$/, "Barcode must contain only numbers");

export function BarcodeScannerView({ 
  videoRef, 
  onProductFound, 
  onClose 
}: BarcodeScannerViewProps) {
  const { isScanning, lastBarcode, error, isSupported, startScanning, stopScanning, clearResult } = useBarcodeScanner();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const scanningActiveRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when manual entry is shown
  useEffect(() => {
    if (showManualEntry && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showManualEntry]);

  // Shared lookup function
  const lookupBarcode = async (barcode: string) => {
    setIsLookingUp(true);
    setLookupError(null);
    setNotFound(false);
    setManualError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("lookup-barcode", {
        body: { barcode },
      });

      if (fnError) {
        throw fnError;
      }

      if (data.found && data.product) {
        onProductFound(data.product, barcode);
      } else {
        setNotFound(true);
        // Clear after delay to allow retry
        setTimeout(() => {
          setNotFound(false);
          if (!showManualEntry) {
            clearResult();
          }
        }, 3000);
      }
    } catch (err) {
      console.error("[BarcodeLookup] Error:", err);
      setLookupError("Failed to look up product");
      setTimeout(() => {
        setLookupError(null);
        if (!showManualEntry) {
          clearResult();
        }
      }, 3000);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Look up barcode when detected by camera
  useEffect(() => {
    if (!lastBarcode) return;
    lookupBarcode(lastBarcode.barcode);
  }, [lastBarcode]);

  // Handle manual barcode submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate barcode
    const result = barcodeSchema.safeParse(manualBarcode);
    if (!result.success) {
      setManualError(result.error.errors[0].message);
      return;
    }
    
    lookupBarcode(result.data);
  };

  // Toggle manual entry mode
  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
    setManualError(null);
    setManualBarcode("");
  };

  return (
    <div className="absolute inset-0 z-20">
      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Darkened areas */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Clear scanning area - only show when not in manual entry */}
        {!showManualEntry && (
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
        )}
      </div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ScanBarcode className="h-5 w-5" />
            <span className="font-medium">
              {showManualEntry ? "Enter Barcode" : "Scan Barcode"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4 pointer-events-auto">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              Enter Barcode Manually
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 5601066600118"
                  value={manualBarcode}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, "");
                    setManualBarcode(value);
                    setManualError(null);
                  }}
                  maxLength={14}
                  className="text-center text-lg tracking-wider font-mono"
                  disabled={isLookingUp}
                />
                {manualError && (
                  <p className="text-destructive text-sm mt-2 text-center">{manualError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLookingUp || manualBarcode.length < 8}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  "Look Up Product"
                )}
              </button>
            </form>
            <button
              onClick={toggleManualEntry}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to camera scanning
            </button>
          </div>
        </div>
      )}

      {/* Status messages */}
      <div className="absolute bottom-32 left-0 right-0 px-4 pointer-events-auto">
        <div className="glass-card p-4 rounded-xl text-center mx-auto max-w-sm">
          {!isSupported && !showManualEntry ? (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Camera scanning not available.</span>
              <button 
                onClick={toggleManualEntry}
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
              >
                <Keyboard className="h-4 w-4" />
                Enter Barcode Manually
              </button>
            </div>
          ) : error && !showManualEntry ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
              <button 
                onClick={toggleManualEntry}
                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Keyboard className="h-4 w-4" />
                Enter manually instead
              </button>
            </div>
          ) : isLookingUp && !showManualEntry ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Looking up product...</span>
            </div>
          ) : lookupError && !showManualEntry ? (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{lookupError}</span>
            </div>
          ) : notFound ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-warning">
                <Package className="h-5 w-5" />
                <span className="text-sm">Product not found in database.</span>
              </div>
              {!showManualEntry && (
                <button 
                  onClick={toggleManualEntry}
                  className="mt-1 text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Keyboard className="h-4 w-4" />
                  Try entering manually
                </button>
              )}
            </div>
          ) : lastBarcode && !showManualEntry ? (
            <div className="text-sm text-muted-foreground">
              Detected: {lastBarcode.barcode}
            </div>
          ) : !showManualEntry ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Point camera at a barcode
              </span>
              <button 
                onClick={toggleManualEntry}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Keyboard className="h-4 w-4" />
                Or enter manually
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Instruction */}
      {!showManualEntry && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-xs text-white/70">
            Works with packaged food barcodes (EAN/UPC)
          </p>
        </div>
      )}
    </div>
  );
}
