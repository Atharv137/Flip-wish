import { Router } from "express";
import { signup, login } from "../controllers/authController";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlistStock } from "../controllers/wishlistController";
import { getCart, addToCart, updateCartItem, deleteCartItem, checkout } from "../controllers/cartController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { getSystemHealth } from "../controllers/systemController";
import { recommendProducts } from "../controllers/aiController";

const router = Router();

// --- Health Check ---
router.get("/health", getSystemHealth);

// --- AI Recommendations ---
router.post("/ai/recommend", recommendProducts);

// --- Authentication ---
router.post("/signup", signup);
router.post("/login", login);

// --- Products (Public catalog) ---
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// --- Admin Product Controls (Protected: Admin Only) ---
router.post("/products", authMiddleware, adminMiddleware, createProduct);
router.patch("/products/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/products/:id", authMiddleware, adminMiddleware, deleteProduct);

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

export default router;
