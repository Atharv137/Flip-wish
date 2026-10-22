import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { CartItem, Product } from "../types";
import { handleFirestoreError } from "../lib/firestoreErrors";
import { fetchProductById } from "./productsService";

export async function getUserCart(userId: string): Promise<CartItem[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, "cart_items"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const items: CartItem[] = [];

    for (const d of snapshot.docs) {
      const data = d.data();
      let product = data.product as Product;
      if (!product || !product.title) {
        const fresh = await fetchProductById(data.productId);
        if (fresh) product = fresh;
      }
      items.push({
        id: d.id,
        userId: data.userId,
        productId: data.productId,
        quantity: data.quantity || 1,
        product
      });
    }

    return items;
  } catch (error) {
    handleFirestoreError(error, "list", `cart_items?userId=${userId}`);
    const local = localStorage.getItem(`electromart_cart_${userId}`);
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

export async function addToUserCart(
  userId: string,
  product: Product,
  quantity = 1
): Promise<CartItem> {
  const cartItemId = "cart_" + userId.slice(0, 5) + "_" + product.id;

  try {
    const docRef = doc(db, "cart_items", cartItemId);
    const item: CartItem = {
      id: cartItemId,
      userId,
      productId: product.id,
      quantity,
      product
    };
    await setDoc(docRef, item);
    return item;
  } catch (error) {
    handleFirestoreError(error, "create", `cart_items/${cartItemId}`);
    const item: CartItem = {
      id: cartItemId,
      userId,
      productId: product.id,
      quantity,
      product
    };
    return item;
  }
}

export async function updateUserCartItemQuantity(
  cartItemId: string,
  newQty: number,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, "cart_items", cartItemId);
    await updateDoc(docRef, { quantity: newQty });
  } catch (error) {
    handleFirestoreError(error, "update", `cart_items/${cartItemId}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_cart_${userId}`);
  if (local) {
    try {
      const list: CartItem[] = JSON.parse(local);
      const updated = list.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQty } : item
      );
      localStorage.setItem(`electromart_cart_${userId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}

export async function removeFromUserCart(
  cartItemId: string,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, "cart_items", cartItemId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, "delete", `cart_items/${cartItemId}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_cart_${userId}`);
  if (local) {
    try {
      const list: CartItem[] = JSON.parse(local);
      const updated = list.filter((item) => item.id !== cartItemId);
      localStorage.setItem(`electromart_cart_${userId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}

export interface ShippingAddress {
  name: string;
  phone: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
}

export async function checkoutUserCart(
  userId: string,
  cartItems: CartItem[],
  shippingAddress?: ShippingAddress
): Promise<{ orderId: string }> {
  const orderId = "order_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  const orderData = {
    id: orderId,
    userId,
    items: cartItems.map((item) => ({
      productId: item.productId,
      title: item.product?.title || "Item",
      price: item.product?.price || 0,
      quantity: item.quantity,
      image: item.product?.image || ""
    })),
    totalAmount,
    shippingAddress: shippingAddress || null,
    status: "placed",
    createdAt: new Date().toISOString()
  };

  try {
    const orderDocRef = doc(db, "orders", orderId);
    await setDoc(orderDocRef, orderData);

    // Clean up cart items from Firestore
    for (const item of cartItems) {
      try {
        await deleteDoc(doc(db, "cart_items", item.id));
      } catch (e) {
        // Continue cleaning remaining
      }
    }
  } catch (error) {
    handleFirestoreError(error, "create", `orders/${orderId}`);
  }

  // Clear local cart
  localStorage.removeItem(`electromart_cart_${userId}`);

  return { orderId };
}
