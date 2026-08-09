import { Router } from "express";
import { signup, login } from "../controllers/authController";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlistStock } from "../controllers/wishlistController";
import { getCart, addToCart, updateCartItem, deleteCartItem, checkout } from "../controllers/cartController";
import { recommendProducts } from "../controllers/aiController";
import { authMiddleware } from "../middleware/auth";
import { createRateLimiter } from "../utils/rateLimiter";
import { getSystemHealth } from "../controllers/systemController";

const router = Router();

// Rate limiter for AI recommendations (max 10 requests per 1 minute)
const aiRateLimiter = createRateLimiter(60 * 1000, 10);

// --- Authentication ---
router.post("/signup", signup);
router.post("/login", login);

// --- Products (Public catalog) ---
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// --- Admin Product Controls (Protected) ---
router.post("/products", authMiddleware, createProduct);
router.patch("/products/:id", authMiddleware, updateProduct);
router.delete("/products/:id", authMiddleware, deleteProduct);

// --- Wishlist (Protected) ---
router.get("/wishlist", authMiddleware, getWishlist);
router.post("/wishlist", authMiddleware, addToWishlist);
router.delete("/wishlist/:id", authMiddleware, removeFromWishlist);

// --- Wishlist Stock Monitoring (Public endpoint for rapid polling) ---
router.post("/wishlist/check-stock", checkWishlistStock);

// --- Cart (Protected) ---
router.get("/cart", authMiddleware, getCart);
router.post("/cart", authMiddleware, addToCart);
router.patch("/cart/:id", authMiddleware, updateCartItem);
router.delete("/cart/:id", authMiddleware, deleteCartItem);
router.post("/cart/checkout", authMiddleware, checkout);

// --- AI Integrations ---
router.post("/ai/recommend", aiRateLimiter, recommendProducts);

// --- System ---
router.get("/system/health", getSystemHealth);

export default router;
