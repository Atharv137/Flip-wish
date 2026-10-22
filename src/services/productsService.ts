import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Product, PaginationData, SortOption } from "../types";
import { DEFAULT_PRODUCTS } from "../data/defaultProducts";
import { handleFirestoreError } from "../lib/firestoreErrors";

let hasAttemptedSeed = false;

/**
 * Seeds default products to Firestore if collection is empty
 */
export async function seedProductsIfEmpty(): Promise<Product[]> {
  if (hasAttemptedSeed) return DEFAULT_PRODUCTS;
  hasAttemptedSeed = true;

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) {
      console.log("Seeding initial products catalog into Firestore...");
      for (const prod of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, "products", prod.id), prod);
      }
    }
  } catch (err) {
    // If permission or offline, we fallback silently to local DEFAULT_PRODUCTS
    console.warn("Notice during products seed check:", err);
  }
  return DEFAULT_PRODUCTS;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly?: boolean;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

/**
 * Fetches products with filtering, sorting, and pagination.
 * Retrieves from Firestore and falls back to DEFAULT_PRODUCTS on error or initial load.
 */
export async function fetchProducts(
  params: ProductFilterParams = {}
): Promise<{ products: Product[]; pagination: PaginationData }> {
  const {
    search = "",
    category = "All",
    brand = [],
    minPrice,
    maxPrice = 200000,
    rating = 0,
    inStockOnly = false,
    sortBy = "newest",
    page = 1,
    limit = 8
  } = params;

  let allProducts: Product[] = [];

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(query(productsRef));

    if (snapshot.empty) {
      await seedProductsIfEmpty();
      allProducts = [...DEFAULT_PRODUCTS];
    } else {
      allProducts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, "id">)
      }));
    }
  } catch (error) {
    handleFirestoreError(error, "list", "products");
    allProducts = [...DEFAULT_PRODUCTS];
  }

  // 1. Search Query
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    allProducts = allProducts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  // 2. Category Filter
  if (category && category !== "All") {
    allProducts = allProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // 3. Brand Filter
  if (brand && brand.length > 0) {
    const lowerBrands = brand.map((b) => b.toLowerCase());
    allProducts = allProducts.filter((p) =>
      lowerBrands.includes(p.brand?.toLowerCase())
    );
  }

  // 4. Price Filter
  if (minPrice !== undefined) {
    allProducts = allProducts.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    allProducts = allProducts.filter((p) => p.price <= maxPrice);
  }

  // 5. Rating Filter
  if (rating > 0) {
    allProducts = allProducts.filter((p) => p.rating >= rating);
  }

  // 6. In Stock Only
  if (inStockOnly) {
    allProducts = allProducts.filter((p) => p.stock > 0);
  }

  // 7. Sorting
  switch (sortBy) {
    case "priceLowToHigh":
      allProducts.sort((a, b) => a.price - b.price);
      break;
    case "priceHighToLow":
      allProducts.sort((a, b) => b.price - a.price);
      break;
    case "highestRated":
      allProducts.sort((a, b) => b.rating - a.rating);
      break;
    case "popularity":
      allProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      break;
    case "newest":
    default:
      // default stable order
      break;
  }

  // 8. Pagination
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedProducts = allProducts.slice(startIndex, startIndex + limit);

  return {
    products: paginatedProducts,
    pagination: {
      totalProducts,
      totalPages,
      currentPage,
      limit
    }
  };
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<Product, "id">) };
    }
  } catch (err) {
    handleFirestoreError(err, "read", `products/${id}`);
  }

  // Fallback to local default catalog
  const found = DEFAULT_PRODUCTS.find((p) => p.id === id);
  return found || null;
}

/**
 * Admin: Create Product in Firestore
 */
export async function createProductInFirestore(productData: Omit<Product, "id">): Promise<Product> {
  const newId = "prod_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const newProduct: Product = { id: newId, ...productData };
  const docRef = doc(db, "products", newId);
  await setDoc(docRef, newProduct);
  return newProduct;
}

/**
 * Admin: Update Product in Firestore
 */
export async function updateProductInFirestore(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, updates);
}

/**
 * Admin: Delete Product in Firestore
 */
export async function deleteProductInFirestore(id: string): Promise<void> {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
}
