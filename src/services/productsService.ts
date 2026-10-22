import { ref, get, set, update, remove } from "firebase/database";
import { db } from "../lib/firebase";
import { Product, PaginationData, SortOption } from "../types";
import { DEFAULT_PRODUCTS } from "../data/defaultProducts";
import { handleDatabaseError } from "../lib/firestoreErrors";

let hasAttemptedSeed = false;

/**
 * Seeds default products to Realtime Database if node is empty
 */
export async function seedProductsIfEmpty(): Promise<Product[]> {
  if (hasAttemptedSeed) return DEFAULT_PRODUCTS;
  hasAttemptedSeed = true;

  try {
    const productsRef = ref(db, "products");
    const snapshot = await get(productsRef);
    if (!snapshot.exists()) {
      console.log("Seeding initial products catalog into Realtime Database...");
      const initialCatalog: Record<string, Product> = {};
      for (const prod of DEFAULT_PRODUCTS) {
        initialCatalog[prod.id] = prod;
      }
      await set(productsRef, initialCatalog);
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
 * Retrieves from Realtime Database and falls back to DEFAULT_PRODUCTS on error or initial load.
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
    const productsRef = ref(db, "products");
    const snapshot = await get(productsRef);

    if (!snapshot.exists()) {
      await seedProductsIfEmpty();
      allProducts = [...DEFAULT_PRODUCTS];
    } else {
      const data = snapshot.val();
      allProducts = Object.values(data) as Product[];
    }
  } catch (error) {
    handleDatabaseError(error, "list", "products");
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
    const brandLower = brand.map((b) => b.toLowerCase());
    allProducts = allProducts.filter((p) =>
      brandLower.includes(p.brand?.toLowerCase() || "")
    );
  }

  // 4. Max Price
  if (maxPrice && maxPrice < 200000) {
    allProducts = allProducts.filter((p) => (p.price || 0) <= maxPrice);
  }

  // 5. Min Rating
  if (rating && rating > 0) {
    allProducts = allProducts.filter((p) => (p.rating || 0) >= rating);
  }

  // 6. In Stock Only
  if (inStockOnly) {
    allProducts = allProducts.filter((p) => (p.stock || 0) > 0);
  }

  // 7. Sorting
  switch (sortBy) {
    case "priceLowToHigh":
      allProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "priceHighToLow":
      allProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "highestRated":
      allProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
    const snapshot = await get(ref(db, `products/${id}`));
    if (snapshot.exists()) {
      return snapshot.val() as Product;
    }
  } catch (err) {
    handleDatabaseError(err, "read", `products/${id}`);
  }

  // Fallback to local default catalog
  const found = DEFAULT_PRODUCTS.find((p) => p.id === id);
  return found || null;
}

/**
 * Admin: Create Product in Realtime Database
 */
export async function createProductInFirestore(productData: Omit<Product, "id">): Promise<Product> {
  const newId = "prod_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const newProduct: Product = { id: newId, ...productData };
  await set(ref(db, `products/${newId}`), newProduct);
  return newProduct;
}

/**
 * Admin: Update Product in Realtime Database
 */
export async function updateProductInFirestore(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  await update(ref(db, `products/${id}`), updates);
}

/**
 * Admin: Delete Product in Realtime Database
 */
export async function deleteProductInFirestore(id: string): Promise<void> {
  await remove(ref(db, `products/${id}`));
}
