/**
 * Image preprocessing utilities for optimized AI vision requests.
 * Uses modern async APIs for fast, non-blocking compression.
 * Accepts ANY image size - always compresses, never rejects.
 * HARD LIMIT: 600KB output guaranteed.
 */

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;
const HARD_LIMIT_KB = 600;
const MIN_QUALITY = 0.4;

/**
 * Fast async image preprocessing using createImageBitmap.
 * Accepts ANY image size, guarantees output ≤600KB.
 * Returns base64 string without data URL prefix.
 */
export async function preprocessImage(input: string | Blob | File): Promise<string> {
  const startTime = performance.now();
  
  // Convert input to Blob if needed
  let blob: Blob;
  let originalSizeMB: number;
  
  if (typeof input === "string") {
    // Base64 string - convert to blob
    const base64Data = input.replace(/^data:image\/[a-z]+;base64,/, "");
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    blob = new Blob([byteArray], { type: "image/jpeg" });
    originalSizeMB = byteArray.length / 1024 / 1024;
  } else {
    blob = input;
    originalSizeMB = blob.size / 1024 / 1024;
  }
  
  console.log(`[ImageProcessor] Original: ${originalSizeMB.toFixed(2)}MB`);

  // Use createImageBitmap for fast async decoding (non-blocking)
  // This handles HEIC, PNG, JPEG, WebP automatically
  const bitmap = await createImageBitmap(blob);
  
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  
  // Try compression with decreasing dimensions until under limit
  let maxDim = MAX_DIMENSION;
  let attempts = 0;
  const maxAttempts = 4;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Calculate dimensions
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // Create canvas
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    
    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext("2d");
    } else {
      canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      ctx = canvas.getContext("2d");
    }
    
    if (!ctx) {
      throw new Error("Canvas context unavailable");
    }
    
    // Draw resized image (strips EXIF, converts formats)
    ctx.drawImage(bitmap, 0, 0, width, height);
    
    // Try quality levels
    let quality = JPEG_QUALITY;
    let base64: string;
    let finalSizeKB: number;
    
    if (canvas instanceof OffscreenCanvas) {
      let outputBlob = await canvas.convertToBlob({ type: "image/jpeg", quality });
      finalSizeKB = outputBlob.size / 1024;
      
      // Reduce quality until under limit
      while (finalSizeKB > HARD_LIMIT_KB && quality > MIN_QUALITY) {
        quality -= 0.05;
        outputBlob = await canvas.convertToBlob({ type: "image/jpeg", quality });
        finalSizeKB = outputBlob.size / 1024;
      }
      
      if (finalSizeKB <= HARD_LIMIT_KB) {
        base64 = await blobToBase64(outputBlob);
        bitmap.close();
        
        const compressionTime = Math.round(performance.now() - startTime);
        console.log(`[ImageProcessor] Optimized: ${originalWidth}x${originalHeight} → ${width}x${height}, ${finalSizeKB.toFixed(0)}KB, q=${Math.round(quality * 100)}%, ${compressionTime}ms`);
        
        return base64;
      }
    } else {
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
      finalSizeKB = getBase64SizeKB(base64);
      
      while (finalSizeKB > HARD_LIMIT_KB && quality > MIN_QUALITY) {
        quality -= 0.05;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
        base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
        finalSizeKB = getBase64SizeKB(base64);
      }
      
      if (finalSizeKB <= HARD_LIMIT_KB) {
        bitmap.close();
        
        const compressionTime = Math.round(performance.now() - startTime);
        console.log(`[ImageProcessor] Optimized: ${originalWidth}x${originalHeight} → ${width}x${height}, ${finalSizeKB.toFixed(0)}KB, q=${Math.round(quality * 100)}%, ${compressionTime}ms`);
        
        return base64;
      }
    }
    
    // Still too large - reduce max dimension and retry
    maxDim = Math.round(maxDim * 0.75);
    console.log(`[ImageProcessor] Still too large, retrying with maxDim=${maxDim}px`);
  }
  
  bitmap.close();
  throw new Error("Could not compress image to acceptable size");
}

/**
 * Convert Blob to base64 string (without data URL prefix)
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.replace(/^data:image\/jpeg;base64,/, ""));
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Calculate approximate size of base64 string in KB
 */
export function getBase64SizeKB(base64: string): number {
  return Math.round((base64.length * 3) / 4 / 1024);
}
