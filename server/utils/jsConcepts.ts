import fs from "fs";

/**
 * CONCEPT: Closures
 * A closure is a function having access to the parent scope, even after the parent function has closed.
 */
export function createStockPoller(initialStock: number) {
  let currentStock = initialStock; // Outer variable

  // The inner function preserves access to currentStock (lexical scope)
  return function updateStock(soldAmount: number) {
    currentStock -= soldAmount;
    return currentStock;
  };
}

/**
 * CONCEPT: Hoisting
 * Function declarations are hoisted to the top of their scope.
 * This allows us to call executeRequest before it's defined in the code.
 */
export function demonstrateHoisting() {
  const result = executeRequest();
  
  function executeRequest() {
    return "Request executed successfully!";
  }
  
  return result;
}

/**
 * CONCEPT: Promises vs Callbacks
 * Demonstrating the difference between Callback-based API and Promise-based API.
 */

// 1. Callback approach
export function readFileWithCallback(callback: (error: Error | null, data?: string) => void) {
  // Using setTimeout to simulate an asynchronous operation
  setTimeout(() => {
    callback(null, "Data read via callback");
  }, 100);
}

// 2. Promise approach
export function readFileWithPromise(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Data read via promise");
    }, 100);
  });
}

/**
 * CONCEPT: Event Loop & async/await
 * This demonstrates how the Call Stack, Web APIs (Timers), Task/Microtask Queue, and Event Loop interact.
 */
export async function demonstrateEventLoop() {
  console.log("1. Sync task (Call Stack)"); // Synchronous

  setTimeout(() => {
    console.log("4. Macrotask (Task Queue -> Event Loop)"); // setTimeout goes to Web APIs, then Task Queue
  }, 0);

  // Promise resolution goes to the Microtask Queue, which the Event Loop prioritizes over the Task Queue
  const result = await readFileWithPromise(); 
  console.log("3. Microtask (Microtask Queue -> Event Loop) - " + result); 

  console.log("2. Sync task (Call Stack) - End of function execution");
}
