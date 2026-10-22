import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/authHelper";
import { db } from "../config/db";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  // Inject userId onto req object as custom property
  (req as any).userId = decoded.userId;
  next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = db.users.findOne(u => u.id === userId);
  const isAdmin = user && (user.email.toLowerCase() === "hargudetejas17@gmail.com" || user.role === "admin");

  if (!isAdmin) {
    return res.status(403).json({ error: "Access denied: Only administrator hargudetejas17@gmail.com has access to this operation." });
  }

  next();
}
