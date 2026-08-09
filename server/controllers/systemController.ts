import { Request, Response } from "express";
import fs from "fs";
import path from "path";

/**
 * Health Check and System Status Endpoint.
 * This function demonstrates two JavaScript concepts:
 * 1. The Event Loop (synchronous, microtasks, macrotasks)
 * 2. Promises vs Callbacks
 */
export async function getSystemHealth(req: Request, res: Response): Promise<void> {
  const logs: string[] = [];
  
  // ==========================================
  // CONCEPT 1: EVENT LOOP
  // Demonstrating the order of execution:
  // Synchronous -> Microtask (Promise) -> Macrotask (setTimeout)
  // ==========================================
  logs.push("1. [Sync] Starting health check...");

  setTimeout(() => {
    // This goes to the Macrotask queue
    logs.push("4. [Macrotask] Timer completed.");
  }, 0);

  Promise.resolve().then(() => {
    // This goes to the Microtask queue
    logs.push("3. [Microtask] Promise resolved.");
  });

  logs.push("2. [Sync] Synchronous operations finished.");

  // ==========================================
  // CONCEPT 2: PROMISES VS CALLBACKS
  // Demonstrating file system read using both approaches
  // ==========================================
  const packageJsonPath = path.resolve(process.cwd(), "package.json");

  // Approach A: Callback
  const callbackResult = await new Promise<string>((resolve) => {
    fs.readFile(packageJsonPath, "utf-8", (err, data) => {
      if (err) {
        resolve("Callback Error: " + err.message);
      } else {
        const parsed = JSON.parse(data);
        resolve(`Callback Success: Read package ${parsed.name}`);
      }
    });
  });

  // Approach B: Promise (using fs.promises and async/await)
  let promiseResult = "";
  try {
    const data = await fs.promises.readFile(packageJsonPath, "utf-8");
    const parsed = JSON.parse(data);
    promiseResult = `Promise Success: Read package ${parsed.name}`;
  } catch (err: any) {
    promiseResult = "Promise Error: " + err.message;
  }

  // We wait slightly so the macrotask (setTimeout) has time to execute and populate logs
  // before we send the response, ensuring the order is clearly visible.
  await new Promise(resolve => setTimeout(resolve, 10));

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    eventLoopDemo: logs,
    asyncComparison: {
      callbackResult,
      promiseResult,
      explanation: "Promises and async/await prevent callback hell and make error handling much cleaner."
    }
  });
}
