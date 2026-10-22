import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { WishlistItem, CartItem } from "../types";
import { useAuth } from "./AuthContext";
import {
  getUserWishlist,
  addToUserWishlist,
  removeFromUserWishlist,
  checkWishlistStockLive
} from "../services/wishlistService";
import {
  getUserCart,
  addToUserCart,
  updateUserCartItemQuantity,
  removeFromUserCart,
  checkoutUserCart,
  ShippingAddress
} from "../services/cartService";
import { fetchProductById } from "../services/productsService";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  text: string;
}

interface CartWishlistContextType {
  wishlist: WishlistItem[];
  cart: CartItem[];
  loading: boolean;
  toasts: ToastMessage[];
  addToast: (text: string, type: "success" | "error" | "warning" | "info") => void;
  removeToast: (id: string) => void;

  // Wishlist Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (wishlistOrProductId: string) => Promise<boolean>;

  // Cart Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateCartQuantity: (cartItemId: string, newQty: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;

  // Unified Operations
  moveToCart: (item: WishlistItem) => Promise<void>;
  checkoutCart: (shippingAddress?: ShippingAddress) => Promise<boolean>;

  // Trigger manual stock check
  checkLatestStock: () => Promise<void>;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export const CartWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Toast helper
  const addToast = (text: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Fetch Operations with Firestore ---
  const fetchWishlist = async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const items = await getUserWishlist(user.id);
      setWishlist(items);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const fetchCart = async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const items = await getUserCart(user.id);
      setCart(items);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // Fetch both when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setLoading(true);
      Promise.all([fetchWishlist(), fetchCart()]).finally(() => setLoading(false));
    } else {
      setWishlist([]);
      setCart([]);
    }
  }, [isAuthenticated, user?.id]);

  // --- Stock Polling ---
  // Audits wishlisted product stock every 30 seconds
  const checkLatestStock = async () => {
    if (wishlist.length === 0) return;

    try {
      const productIds = wishlist.map((item) => item.productId);
      const stockMap = await checkWishlistStockLive(productIds);

      setWishlist((currentWishlist) => {
        let hasChanges = false;
        const updated = currentWishlist.map((item) => {
          const latest = stockMap[item.productId];
          if (
            latest &&
            (item.product.stock !== latest.stock || item.product.price !== latest.price)
          ) {
            hasChanges = true;
            return {
              ...item,
              product: {
                ...item.product,
                stock: latest.stock,
                price: latest.price,
                originalPrice: latest.originalPrice
              }
            };
          }
          return item;
        });

        if (hasChanges) {
          console.log("Stock levels refreshed for wishlisted items.");
        }
        return updated;
      });
    } catch (err) {
      console.error("Error checking stock status:", err);
    }
  };

  // 30-second interval for stock checks
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (isAuthenticated && wishlist.length > 0) {
      pollingIntervalRef.current = setInterval(() => {
        checkLatestStock();
      }, 30000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [wishlist.map((w) => w.productId).join(","), isAuthenticated]);

  // --- Wishlist Actions ---
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      addToast("Please login to add items to wishlist", "warning");
      return false;
    }
    try {
      const product = await fetchProductById(productId);
      if (!product) {
        addToast("Product not found", "error");
        return false;
      }

      const item = await addToUserWishlist(user.id, product);
      setWishlist((prev) => [...prev.filter((w) => w.productId !== productId), item]);
      addToast("Added to Wishlist", "success");
      return true;
    } catch (err) {
      addToast("Could not add to wishlist. Please try again.", "error");
      return false;
    }
  };

  const removeFromWishlist = async (wishlistOrProductId: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      await removeFromUserWishlist(wishlistOrProductId, user.id);
      addToast("Removed from Wishlist", "info");
      setWishlist((prev) =>
        prev.filter(
          (item) =>
            item.id !== wishlistOrProductId && item.productId !== wishlistOrProductId
        )
      );
      return true;
    } catch (err) {
      addToast("Could not remove from wishlist.", "error");
      return false;
    }
  };

  // --- Cart Actions ---
  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      addToast("Please login to add items to cart", "warning");
      return false;
    }
    try {
      const product = await fetchProductById(productId);
      if (!product) {
        addToast("Product not found", "error");
        return false;
      }

      if (product.stock <= 0) {
        addToast("Product is currently out of stock", "error");
        return false;
      }

      const item = await addToUserCart(user.id, product, quantity);
      setCart((prev) => {
        const existing = prev.find((c) => c.productId === productId);
        if (existing) {
          return prev.map((c) =>
            c.productId === productId
              ? { ...c, quantity: Math.min(product.stock, c.quantity + quantity) }
              : c
          );
        }
        return [...prev, item];
      });

      addToast("Added to Cart", "success");
      return true;
    } catch (err) {
      addToast("Could not add to cart. Please try again.", "error");
      return false;
    }
  };

  const updateCartQuantity = async (cartItemId: string, newQty: number): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      await updateUserCartItemQuantity(cartItemId, newQty, user.id);
      addToast("Quantity Updated", "success");
      setCart((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
      );
      return true;
    } catch (err) {
      addToast("Could not update quantity.", "error");
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      await removeFromUserCart(cartItemId, user.id);
      addToast("Item Removed", "info");
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return true;
    } catch (err) {
      addToast("Could not remove from cart.", "error");
      return false;
    }
  };

  // --- Optimistic UI Move-to-Cart Operation ---
  const moveToCart = async (item: WishlistItem) => {
    if (item.product.stock <= 0) {
      addToast("Out Of Stock! Cannot add item to cart.", "error");
      return;
    }

    if (!user?.id) {
      addToast("Please login to move items to cart", "warning");
      return;
    }

    // Capture baseline states for rollback
    const previousWishlist = [...wishlist];
    const previousCart = [...cart];

    // Optimistic Updates
    setWishlist((prev) => prev.filter((w) => w.id !== item.id));

    const alreadyInCart = cart.find((c) => c.productId === item.productId);
    if (alreadyInCart) {
      setCart((prev) =>
        prev.map((c) =>
          c.id === alreadyInCart.id
            ? { ...c, quantity: Math.min(c.product.stock, c.quantity + 1) }
            : c
        )
      );
    } else {
      const optimisticCartItem: CartItem = {
        id: "optimistic_" + Math.random().toString(36).substring(2, 9),
        userId: item.userId,
        productId: item.productId,
        quantity: 1,
        product: item.product
      };
      setCart((prev) => [...prev, optimisticCartItem]);
    }

    addToast("Moving item to cart...", "info");

    try {
      // Perform database operations in Firestore
      await addToUserCart(user.id, item.product, 1);
      await removeFromUserWishlist(item.id, user.id);

      // Re-fetch to ensure fresh data
      await Promise.all([fetchWishlist(), fetchCart()]);
      addToast("Added To Cart & Removed From Wishlist", "success");
    } catch (err: any) {
      // Rollback on failure
      setWishlist(previousWishlist);
      setCart(previousCart);
      addToast(err.message || "Failed to move item to cart", "error");
      setTimeout(() => {
        addToast("Wishlist Restored", "info");
      }, 1000);
    }
  };

  const checkoutCart = async (shippingAddress?: ShippingAddress): Promise<boolean> => {
    if (!user?.id || cart.length === 0) {
      addToast("Cart is empty", "warning");
      return false;
    }

    try {
      await checkoutUserCart(user.id, cart, shippingAddress);
      addToast("Order Placed Successfully!", "success");
      setCart([]);
      return true;
    } catch (err) {
      addToast("Checkout failed. Please try again.", "error");
      return false;
    }
  };

  const value = {
    wishlist,
    cart,
    loading,
    toasts,
    addToast,
    removeToast,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    fetchCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    moveToCart,
    checkoutCart,
    checkLatestStock
  };

  return <CartWishlistContext.Provider value={value}>{children}</CartWishlistContext.Provider>;
};

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (context === undefined) {
    throw new Error("useCartWishlist must be used within a CartWishlistProvider");
  }
  return context;
};
