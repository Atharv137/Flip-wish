import { ref, get, set, update, remove } from "firebase/database";
import { db } from "../lib/firebase";
import { CartItem, Product } from "../types";
import { handleDatabaseError } from "../lib/firestoreErrors";
import { fetchProductById } from "./productsService";

/**
 * Retrieve user cart items from Realtime Database under carts/{uid}
 */
export async function getUserCart(userId: string): Promise<CartItem[]> {
  if (!userId) return [];
  try {
    const userCartRef = ref(db, `carts/${userId}`);
    const snapshot = await get(userCartRef);
    if (!snapshot.exists()) return [];

    const val = snapshot.val();
    const rawItems: CartItem[] = Array.isArray(val)
      ? val.filter(Boolean)
      : Object.values(val);

    const items: CartItem[] = [];

    for (const data of rawItems) {
      if (!data) continue;
      let product = data.product as Product;
      if (!product || !product.title) {
        const fresh = await fetchProductById(data.productId);
        if (fresh) product = fresh;
      }
      items.push({
        id: data.id || `cart_${userId.slice(0, 5)}_${data.productId}`,
        userId: data.userId || userId,
        productId: data.productId,
        quantity: data.quantity || 1,
        product
      });
    }

    return items;
  } catch (error) {
    handleDatabaseError(error, "list", `carts/${userId}`);
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

/**
 * Add or update item in user cart under carts/{uid}/{productId}
 */
export async function addToUserCart(
  userId: string,
  product: Product,
  quantity = 1
): Promise<CartItem> {
  const cartItemId = "cart_" + userId.slice(0, 5) + "_" + product.id;
  const item: CartItem = {
    id: cartItemId,
    userId,
    productId: product.id,
    quantity,
    product
  };

  try {
    const itemRef = ref(db, `carts/${userId}/${product.id}`);
    await set(itemRef, item);
    return item;
  } catch (error) {
    handleDatabaseError(error, "create", `carts/${userId}/${product.id}`);
    return item;
  }
}

/**
 * Update quantity of item in user cart
 */
export async function updateUserCartItemQuantity(
  cartItemId: string,
  newQty: number,
  userId: string
): Promise<void> {
  const prodId = cartItemId.startsWith("cart_")
    ? cartItemId.split("_").slice(2).join("_")
    : cartItemId;

  try {
    await update(ref(db, `carts/${userId}/${prodId}`), { quantity: newQty });
  } catch (error) {
    handleDatabaseError(error, "update", `carts/${userId}/${prodId}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_cart_${userId}`);
  if (local) {
    try {
      const list: CartItem[] = JSON.parse(local);
      const updated = list.map((item) =>
        item.id === cartItemId || item.productId === prodId
          ? { ...item, quantity: newQty }
          : item
      );
      localStorage.setItem(`electromart_cart_${userId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Remove item from user cart
 */
export async function removeFromUserCart(
  cartItemId: string,
  userId: string
): Promise<void> {
  const prodId = cartItemId.startsWith("cart_")
    ? cartItemId.split("_").slice(2).join("_")
    : cartItemId;

  try {
    await remove(ref(db, `carts/${userId}/${prodId}`));
    if (prodId !== cartItemId) {
      await remove(ref(db, `carts/${userId}/${cartItemId}`));
    }
  } catch (error) {
    handleDatabaseError(error, "delete", `carts/${userId}/${prodId}`);
  }

  // Update local cache
  const local = localStorage.getItem(`electromart_cart_${userId}`);
  if (local) {
    try {
      const list: CartItem[] = JSON.parse(local);
      const updated = list.filter(
        (item) => item.id !== cartItemId && item.productId !== prodId
      );
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

/**
 * Place customer order and clean up cart under carts/{uid}
 */
export async function checkoutUserCart(
  userId: string,
  cartItems: CartItem[],
  shippingAddress?: ShippingAddress
): Promise<{ orderId: string }> {
  const orderId =
    "order_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
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
    // Store order under orders/{uid}/{orderId}
    await set(ref(db, `orders/${userId}/${orderId}`), orderData);

    // Clean up cart items from Realtime Database
    await remove(ref(db, `carts/${userId}`));
  } catch (error) {
    handleDatabaseError(error, "create", `orders/${userId}/${orderId}`);
  }

  // Clear local cart cache
  localStorage.removeItem(`electromart_cart_${userId}`);

  return { orderId };
}
