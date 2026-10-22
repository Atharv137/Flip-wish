import { ref, get, set, remove } from "firebase/database";
import { db } from "../lib/firebase";
import { WishlistItem, Product } from "../types";
import { handleDatabaseError } from "../lib/firestoreErrors";
import { fetchProductById } from "./productsService";

/**
 * Retrieve user wishlist items from Realtime Database under wishlists/{uid}
 */
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  if (!userId) return [];
  try {
    const userWishRef = ref(db, `wishlists/${userId}`);
    const snapshot = await get(userWishRef);
    if (!snapshot.exists()) return [];

    const val = snapshot.val();
    const rawItems: WishlistItem[] = Array.isArray(val)
      ? val.filter(Boolean)
      : Object.values(val);

    const items: WishlistItem[] = [];

    for (const data of rawItems) {
      if (!data) continue;
      let product = data.product as Product;
      // If product object is missing or stale, fetch latest
      if (!product || !product.title) {
        const fresh = await fetchProductById(data.productId);
        if (fresh) product = fresh;
      }
      items.push({
        id: data.id || `wish_${userId.slice(0, 5)}_${data.productId}`,
        userId: data.userId || userId,
        productId: data.productId,
        addedAt: data.addedAt || new Date().toISOString(),
        product
      });
    }

    return items;
  } catch (error) {
    handleDatabaseError(error, "list", `wishlists/${userId}`);
    // Check localStorage fallback for offline resilience
    const local = localStorage.getItem(`electromart_wishlist_${userId}`);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

/**
 * Add product to user wishlist in Realtime Database under wishlists/{uid}/{productId}
 */
export async function addToUserWishlist(
  userId: string,
  product: Product
): Promise<WishlistItem> {
  const wishId = "wish_" + userId.slice(0, 5) + "_" + product.id;
  const item: WishlistItem = {
    id: wishId,
    userId,
    productId: product.id,
    addedAt: new Date().toISOString(),
    product
  };

  try {
    const itemRef = ref(db, `wishlists/${userId}/${product.id}`);
    await set(itemRef, item);
  } catch (error) {
    handleDatabaseError(error, "create", `wishlists/${userId}/${product.id}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_wishlist_${userId}`);
  const currentList: WishlistItem[] = local ? JSON.parse(local) : [];
  const updated = [...currentList.filter((w) => w.productId !== product.id), item];
  localStorage.setItem(`electromart_wishlist_${userId}`, JSON.stringify(updated));

  return item;
}

/**
 * Remove product from user wishlist in Realtime Database
 */
export async function removeFromUserWishlist(
  wishlistOrProductId: string,
  userId: string
): Promise<void> {
  try {
    // If it's a compound wishlist ID "wish_xyz_prod1", extract product id
    const prodId = wishlistOrProductId.startsWith("wish_")
      ? wishlistOrProductId.split("_").slice(2).join("_")
      : wishlistOrProductId;

    // Delete directly from wishlists/{userId}/{prodId}
    await remove(ref(db, `wishlists/${userId}/${prodId}`));

    // Also attempt cleanup if stored by direct ID
    if (prodId !== wishlistOrProductId) {
      await remove(ref(db, `wishlists/${userId}/${wishlistOrProductId}`));
    }
  } catch (err) {
    handleDatabaseError(err, "delete", `wishlists/${userId}/${wishlistOrProductId}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_wishlist_${userId}`);
  if (local) {
    try {
      const currentList: WishlistItem[] = JSON.parse(local);
      const updated = currentList.filter(
        (w) => w.id !== wishlistOrProductId && w.productId !== wishlistOrProductId
      );
      localStorage.setItem(`electromart_wishlist_${userId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Live stock check for wishlisted products
 */
export async function checkWishlistStockLive(
  productIds: string[]
): Promise<Record<string, { stock: number; price: number; originalPrice: number }>> {
  const stockMap: Record<string, { stock: number; price: number; originalPrice: number }> = {};
  for (const pid of productIds) {
    const p = await fetchProductById(pid);
    if (p) {
      stockMap[pid] = {
        stock: p.stock,
        price: p.price,
        originalPrice: p.originalPrice
      };
    }
  }
  return stockMap;
}
