export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  discount: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  deliveryDate: string;
}

export interface WishlistItem {
  id: string; // Wishlist record ID
  userId: string;
  productId: string;
  addedAt: string;
  product: Product; // populated
}

export interface CartItem {
  id: string; // Cart record ID
  userId: string;
  productId: string;
  quantity: number;
  product: Product; // populated
}

export interface FilterState {
  search: string;
  category: string[];
  brand: string[];
  minPrice: number;
  maxPrice: number;
  rating: number;
  inStockOnly: boolean;
}

export type SortOption = "newest" | "popularity" | "priceLowToHigh" | "priceHighToLow" | "highestRated";

export interface PaginationData {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
