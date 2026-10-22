import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { WishlistItem, Product } from "../types";
import { handleFirestoreError } from "../lib/firestoreErrors";
import { fetchProductById } from "./productsService";

export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, "wishlists"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const items: WishlistItem[] = [];

    for (const d of snapshot.docs) {
      const data = d.data();
      let product = data.product as Product;
      // If product object is missing or stale, fetch latest
      if (!product || !product.title) {
        const fresh = await fetchProductById(data.productId);
        if (fresh) product = fresh;
      }
      items.push({
        id: d.id,
        userId: data.userId,
        productId: data.productId,
        addedAt: data.addedAt || new Date().toISOString(),
        product
      });
    }

    return items;
  } catch (error) {
    handleFirestoreError(error, "list", `wishlists?userId=${userId}`);
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
    const docRef = doc(db, "wishlists", wishId);
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, "create", `wishlists/${wishId}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_wishlist_${userId}`);
  const currentList: WishlistItem[] = local ? JSON.parse(local) : [];
  const updated = [...currentList.filter((w) => w.productId !== product.id), item];
  localStorage.setItem(`electromart_wishlist_${userId}`, JSON.stringify(updated));

  return item;
}

export async function removeFromUserWishlist(
  wishlistOrProductId: string,
  userId: string
): Promise<void> {
  try {
    // If it's a direct wishlist ID
    const directDocRef = doc(db, "wishlists", wishlistOrProductId);
    await deleteDoc(directDocRef);
  } catch (e) {
    // Might be product ID, try compound ID or query
    try {
      const compoundId = "wish_" + userId.slice(0, 5) + "_" + wishlistOrProductId;
      await deleteDoc(doc(db, "wishlists", compoundId));
    } catch (err) {
      handleFirestoreError(err, "delete", `wishlists/${wishlistOrProductId}`);
    }
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
