import { Request, Response, NextFunction } from "express";

/**
 * Creates a simple rate limiter middleware.
 * This demonstrates the JavaScript Closure concept:
 * The returned middleware function retains access to the 'requests' map
 * even after 'createRateLimiter' has finished execution.
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
  // 'requests' is enclosed and persists across requests
  const requests = new Map<string, { count: number; firstRequestTime: number }>();

  return function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record) {
      requests.set(ip, { count: 1, firstRequestTime: now });
      return next();
    }

    if (now - record.firstRequestTime > windowMs) {
      // Reset the window
      requests.set(ip, { count: 1, firstRequestTime: now });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}
