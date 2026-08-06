import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { WishlistItem, CartItem, Product } from "../types";
import { useAuth } from "./AuthContext";
import { API_URL } from "../config";

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
  checkoutCart: () => Promise<boolean>;
  
  // Trigger manual stock check
  checkLatestStock: () => Promise<void>;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export const CartWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom Toast helper
  const addToast = (text: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth header helper
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  };

  // --- Fetch Operations ---
  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_URL}/api/cart`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        // The API returns { cartItems: [...], summary: {...} }
        setCart(data.cartItems || []);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  // Fetch both on authentication
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([fetchWishlist(), fetchCart()]).finally(() => setLoading(false));
    } else {
      setWishlist([]);
      setCart([]);
    }
  }, [isAuthenticated, token]);

  // --- Stock Polling ---
  // Core Requirement: Every 30 seconds, only wishlist products check latest stock and automatically update UI without refreshing
  const checkLatestStock = async () => {
    if (wishlist.length === 0) return;

    try {
      const productIds = wishlist.map((item) => item.productId);
      const res = await fetch(`${API_URL}/api/wishlist/check-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds })
      });

      if (res.ok) {
        const { stockMap } = await res.json();
        
        setWishlist((currentWishlist) => {
          let hasChanges = false;
          const updated = currentWishlist.map((item) => {
            const latest = stockMap[item.productId];
            if (latest && (item.product.stock !== latest.stock || item.product.price !== latest.price)) {
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
      }
    } catch (err) {
      console.error("Error checking stock status:", err);
    }
  };

  // Setting up 30-second interval for stock checks
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
  }, [wishlist.map(w => w.productId).join(","), isAuthenticated]);

  // --- Wishlist Actions ---
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      addToast("Please login to add items to wishlist", "warning");
      return false;
    }
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ productId })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Failed to add to wishlist", "error");
        return false;
      }

      addToast("Added to Wishlist", "success");
      await fetchWishlist(); // Refresh to get fully populated object
      return true;
    } catch (err) {
      addToast("Network error. Could not add to wishlist.", "error");
      return false;
    }
  };

  const removeFromWishlist = async (wishlistOrProductId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${wishlistOrProductId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Failed to remove from wishlist", "error");
        return false;
      }

      addToast("Removed from Wishlist", "info");
      setWishlist((prev) => prev.filter((item) => item.id !== wishlistOrProductId && item.productId !== wishlistOrProductId));
      return true;
    } catch (err) {
      addToast("Network error. Could not remove from wishlist.", "error");
      return false;
    }
  };

  // --- Cart Actions ---
  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      addToast("Please login to add items to cart", "warning");
      return false;
    }
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Failed to add to cart", "error");
        return false;
      }

      addToast("Added to Cart", "success");
      await fetchCart(); // Refresh cart items
      return true;
    } catch (err) {
      addToast("Network error. Could not add to cart.", "error");
      return false;
    }
  };

  const updateCartQuantity = async (cartItemId: string, newQty: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ quantity: newQty })
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Failed to update quantity", "error");
        return false;
      }

      addToast("Quantity Updated", "success");
      setCart((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
      );
      return true;
    } catch (err) {
      addToast("Network error. Could not update quantity.", "error");
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Failed to remove from cart", "error");
        return false;
      }

      addToast("Item Removed", "info");
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return true;
    } catch (err) {
      addToast("Network error. Could not remove from cart.", "error");
      return false;
    }
  };

  // --- Core Requirement: Optimistic UI Move-to-Cart Operation ---
  // Workflow:
  // Wishlist -> Click Move To Cart -> Immediately Remove Item -> Backend API
  // -> If Success: Keep Item In Cart -> If Failure: Restore Wishlist Item & Show Error Toast
  const moveToCart = async (item: WishlistItem) => {
    // 1. Guard check: Reject immediately if product is known to be out of stock
    if (item.product.stock <= 0) {
      addToast("Out Of Stock! Cannot add item to cart.", "error");
      return;
    }

    // 2. Capture baseline states for potential rollbacks
    const previousWishlist = [...wishlist];
    const previousCart = [...cart];

    // 3. Optimistic Updates
    // Immediately remove item from wishlist state
    setWishlist((prev) => prev.filter((w) => w.id !== item.id));

    // Optimistically add to cart state (if not already there)
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
        id: "optimistic_" + Math.random().toString(36).substr(2, 9),
        userId: item.userId,
        productId: item.productId,
        quantity: 1,
        product: item.product
      };
      setCart((prev) => [...prev, optimisticCartItem]);
    }

    // Inform the user of optimistic initiation
    addToast("Moving item to cart...", "info");

    try {
      // 4. Fire API calls: First add to cart, then remove from wishlist
      const addRes = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ productId: item.productId, quantity: 1 })
      });

      const addData = await addRes.json();

      if (!addRes.ok) {
        // Backend Validation failed (e.g. Out Of Stock, or stock level changed)
        throw new Error(addData.error || "Backend stock validation failed.");
      }

      // Now delete from wishlist in backend
      const deleteRes = await fetch(`${API_URL}/api/wishlist/${item.id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      if (!deleteRes.ok) {
        // Wishlist removal failed, but we've successfully added to cart. Re-fetch wishlist to stay sync.
        await fetchWishlist();
        await fetchCart();
        addToast("Added to Cart", "success");
        return;
      }

      // 5. Success! Re-fetch to synchronize real backend IDs
      await Promise.all([fetchWishlist(), fetchCart()]);
      addToast("Added To Cart & Removed From Wishlist", "success");
    } catch (err: any) {
      // 6. Rollback triggered on error!
      setWishlist(previousWishlist);
      setCart(previousCart);
      addToast(err.message || "Out Of Stock", "error");
      setTimeout(() => {
        addToast("Wishlist Restored", "info");
      }, 1000);
    }
  };

  const checkoutCart = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/cart/checkout`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || "Checkout failed", "error");
        return false;
      }

      addToast("Order Placed Successfully!", "success");
      setCart([]);
      return true;
    } catch (err) {
      addToast("Network error during checkout.", "error");
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
