/**
 * Simple performance logger for scan timing metrics.
 * Logs internally only - no UI display.
 */

interface ScanMetrics {
  captureStart: number;
  uiResponseTime?: number;
  preprocessTime?: number;
  aiResponseTime?: number;
  finalRenderTime?: number;
}

let currentMetrics: ScanMetrics | null = null;

export function startScanMetrics(): void {
  currentMetrics = {
    captureStart: performance.now(),
  };
}

export function markUIResponse(): void {
  if (currentMetrics) {
    currentMetrics.uiResponseTime = performance.now() - currentMetrics.captureStart;
    console.log(`[Perf] UI response: ${currentMetrics.uiResponseTime.toFixed(0)}ms`);
  }
}

export function markPreprocessComplete(): void {
  if (currentMetrics) {
    currentMetrics.preprocessTime = performance.now() - currentMetrics.captureStart;
    console.log(`[Perf] Preprocess complete: ${currentMetrics.preprocessTime.toFixed(0)}ms`);
  }
}

export function markAIResponse(): void {
  if (currentMetrics) {
    currentMetrics.aiResponseTime = performance.now() - currentMetrics.captureStart;
    console.log(`[Perf] AI response: ${currentMetrics.aiResponseTime.toFixed(0)}ms`);
  }
}

export function markFinalRender(): void {
  if (currentMetrics) {
    currentMetrics.finalRenderTime = performance.now() - currentMetrics.captureStart;
    console.log(`[Perf] Final render: ${currentMetrics.finalRenderTime.toFixed(0)}ms`);
    logSummary();
  }
}

function logSummary(): void {
  if (!currentMetrics) return;
  
  console.log(`[Perf] Scan Summary:
  - UI Response: ${currentMetrics.uiResponseTime?.toFixed(0) ?? "N/A"}ms
  - Preprocess: ${currentMetrics.preprocessTime?.toFixed(0) ?? "N/A"}ms  
  - AI Response: ${currentMetrics.aiResponseTime?.toFixed(0) ?? "N/A"}ms
  - Final Render: ${currentMetrics.finalRenderTime?.toFixed(0) ?? "N/A"}ms`);
}

export function resetMetrics(): void {
  currentMetrics = null;
}
