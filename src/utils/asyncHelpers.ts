/**
 * JavaScript Concept: Promises vs Callbacks
 * These utilities simulate a data processing task using both approaches.
 */

// 1. Callback approach
export function simulateDataProcessingCallback(
  data: any, 
  callback: (error: string | null, result?: string) => void
) {
  setTimeout(() => {
    if (!data) {
      callback("No data provided");
    } else {
      callback(null, "Processed successfully via Callback");
    }
  }, 100);
}

// 2. Promise approach
export function simulateDataProcessingPromise(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data) {
        reject("No data provided");
      } else {
        resolve("Processed successfully via Promise");
      }
    }, 100);
  });
}
