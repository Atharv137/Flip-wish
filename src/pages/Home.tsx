import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product, PaginationData, SortOption } from "../types";
import { ProductCard } from "../components/ProductCard";
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, Sparkles, Flame, Percent, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { API_URL } from "../config";

const CATEGORIES = [
  "All",
  "Smartphones",
  "Laptops",
  "Tablets",
  "Smart Watches",
  "Earbuds",
  "Headphones",
  "Cameras",
  "Gaming Consoles",
  "Monitors",
  "Speakers",
  "Keyboards",
  "Mouse"
];

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "OnePlus",
  "Nothing",
  "Dell",
  "ASUS",
  "Acer",
  "Lenovo",
  "Sony",
  "Canon",
  "Microsoft",
  "LG",
  "Logitech",
  "JBL"
];

// Carousel items
const HERO_BANNERS = [
  {
    id: 1,
    title: "Flagship Smartphone Carnival",
    subtitle: "Incredible discounts on iPhone 16 Pro, Galaxy S25 & more!",
    tag: "Super Saving Days",
    accent: "bg-[#2874F0]",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    discountText: "Up to 15% Off"
  },
  {
    id: 2,
    title: "Premium Laptops Showcase",
    subtitle: "Unleash extreme power with the M4 Macbook Air & ROG Zephyrus.",
    tag: "Back to College",
    accent: "bg-[#FB641B]",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    discountText: "Up to ₹20,000 Off"
  },
  {
    id: 3,
    title: "Ultimate Sound Experience",
    subtitle: "Immersive soundscapes. Sony XM6 headphones & AirPods Pro 3.",
    tag: "Acoustic Wonders",
    accent: "bg-slate-900",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    discountText: "Flat 14% Off"
  }
];

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter & Sorting state synchronized to URL or Local State
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Auto carousel rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products from API on filter change
  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "All") queryParams.append("category", selectedCategory);
      if (selectedBrands.length > 0) queryParams.append("brand", selectedBrands.join(","));
      if (maxPrice < 200000) queryParams.append("maxPrice", String(maxPrice));
      if (minRating > 0) queryParams.append("rating", String(minRating));
      if (inStockOnly) queryParams.append("inStock", "true");
      queryParams.append("sortBy", sortBy);
      queryParams.append("page", String(page));
      queryParams.append("limit", "8");

      const response = await fetch(`${API_URL}/api/products?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [searchQuery, selectedCategory, selectedBrands, maxPrice, minRating, inStockOnly, sortBy, page]);

  // Handle Category Pill click
  const handleCategoryPillClick = (cat: string) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const handleBrandCheckbox = (brand: string) => {
    setPage(1);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSelectedBrands([]);
    setMaxPrice(200000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy("newest");
    setPage(1);
  };

  // Pagination triggers
  const handlePageChange = (pageNum: number) => {
    if (pagination && pageNum >= 1 && pageNum <= pagination.totalPages) {
      setPage(pageNum);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      {/* 1. Category Bar Row (Standard Flipkart layout) */}
      <div className="bg-white border-b border-slate-100 shadow-sm overflow-x-auto scrollbar-none py-3">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-2 md:gap-4 shrink-0 min-w-max">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryPillClick(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 shrink-0 border ${
                  active
                    ? "bg-[#2874F0] text-white border-[#2874F0] shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-5">
        {/* 2. Premium Hero Carousel */}
        <div className="relative rounded-lg shadow-md h-[240px] md:h-[320px] overflow-hidden mb-6 bg-white flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 flex flex-col md:flex-row items-center justify-between p-6 md:p-10 text-white ${HERO_BANNERS[currentSlide].accent}`}
            >
              {/* Promo details */}
              <div className="z-10 flex flex-col justify-center h-full max-w-xl text-left gap-1 md:gap-3">
                <span className="bg-[#FFE500] text-slate-900 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full w-fit flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-slate-900" />
                  {HERO_BANNERS[currentSlide].tag}
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-tight">
                  {HERO_BANNERS[currentSlide].title}
                </h2>
                <p className="text-slate-100 text-xs md:text-sm font-light">
                  {HERO_BANNERS[currentSlide].subtitle}
                </p>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="border-2 border-dashed border-[#FFE500] text-[#FFE500] font-bold text-sm px-4 py-1.5 rounded-md flex items-center gap-1.5">
                    <Percent className="w-4.5 h-4.5" />
                    {HERO_BANNERS[currentSlide].discountText}
                  </span>
                  <button
                    onClick={() => handleCategoryPillClick("Smartphones")}
                    className="bg-white text-slate-900 hover:bg-[#FFE500] transition-colors text-xs font-bold px-5 py-2 rounded shadow cursor-pointer"
                  >
                    SHOP NOW
                  </button>
                </div>
              </div>

              {/* Promo image */}
              <div className="hidden md:block w-1/3 h-full relative p-4">
                <img
                  src={HERO_BANNERS[currentSlide].image}
                  alt={HERO_BANNERS[currentSlide].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg shadow-lg border border-white/10"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel dots */}
          <div className="absolute bottom-4 left-6 z-10 flex gap-2">
            {HERO_BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "bg-white w-6" : "bg-white/40"
                }`}
              ></button>
            ))}
          </div>
        </div>

        {/* 3. Catalog Shell */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* A. Sidebar Filters (Desktop) */}
          <aside className="w-64 bg-white p-5 rounded-lg shadow-sm border border-slate-100 hidden lg:block shrink-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="font-bold text-slate-800 text-sm">Filters</span>
              <button
                onClick={resetAllFilters}
                className="text-xs font-semibold text-[#2874F0] hover:text-[#fb641b] transition-colors cursor-pointer"
              >
                CLEAR ALL
              </button>
            </div>

            {/* Price filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Price Max Limit</h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => {
                    setPage(1);
                    setMaxPrice(Number(e.target.value));
                  }}
                  className="w-full accent-[#2874F0]"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Min: ₹5,000</span>
                  <span className="text-[#2874F0] font-bold">Max: ₹{maxPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Brand filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Brand</h4>
              <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar text-xs">
                {BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandCheckbox(brand)}
                      className="rounded border-slate-300 text-[#2874F0] focus:ring-[#2874F0] w-4 h-4 accent-[#2874F0]"
                    />
                    <span className="font-medium">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ratings Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Customer Rating</h4>
              <div className="space-y-2.5 text-xs text-slate-600">
                {[4, 3].map((r) => (
                  <label key={r} className="flex items-center gap-2 hover:text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => {
                        setPage(1);
                        setMinRating(r);
                      }}
                      className="w-4 h-4 accent-[#2874F0]"
                    />
                    <span className="font-medium">{r}★ & above</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 hover:text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 0}
                    onChange={() => {
                      setPage(1);
                      setMinRating(0);
                    }}
                    className="w-4 h-4 accent-[#2874F0]"
                  />
                  <span className="font-medium">All Ratings</span>
                </label>
              </div>
            </div>

            {/* Availability */}
            <div className="mb-2">
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Availability</h4>
              <label className="flex items-center gap-2 text-slate-600 hover:text-slate-800 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setPage(1);
                    setInStockOnly(e.target.checked);
                  }}
                  className="rounded border-slate-300 text-[#2874F0] w-4 h-4 accent-[#2874F0]"
                />
                <span className="font-medium">In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* B. Main Catalog Area */}
          <main className="flex-1 w-full">
            
            {/* Header controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-slate-800 font-bold text-sm flex items-center gap-1.5">
                  <span>
                    {searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : selectedCategory === "All"
                      ? "Featured Electronics"
                      : selectedCategory}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#FFE500] fill-[#FFE500]" />
                </h3>
                <p className="text-[#878787] text-xs mt-0.5">
                  {pagination ? `${pagination.totalProducts} items found` : "Searching catalog..."}
                </p>
              </div>

              {/* Sorting and Mobile toggles */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-1.5 rounded cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#878787] font-medium shrink-0">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setPage(1);
                      setSortBy(e.target.value as SortOption);
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-[#2874F0] cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="popularity">Popularity</option>
                    <option value="priceLowToHigh">Price: Low to High</option>
                    <option value="priceHighToLow">Price: High to Low</option>
                    <option value="highestRated">Customer Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filters summary */}
            {(selectedBrands.length > 0 || maxPrice < 200000 || minRating > 0 || inStockOnly) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                <span className="text-[#878787] font-medium">Active Filters:</span>
                {selectedBrands.map((b) => (
                  <span key={b} className="bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                    {b}
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => handleBrandCheckbox(b)} />
                  </span>
                ))}
                {maxPrice < 200000 && (
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                    &lt; ₹{maxPrice.toLocaleString()}
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setMaxPrice(200000)} />
                  </span>
                )}
                {minRating > 0 && (
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                    {minRating}★+
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setMinRating(0)} />
                  </span>
                )}
                {inStockOnly && (
                  <span className="bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                    In Stock
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setInStockOnly(false)} />
                  </span>
                )}
                <button onClick={resetAllFilters} className="text-[#FB641B] font-semibold hover:underline">
                  Clear All
                </button>
              </div>
            )}

            {/* Products Listing or Skeleton Loaders */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-slate-100 p-4 h-[350px] flex flex-col justify-between animate-pulse">
                    <div>
                      <div className="w-full aspect-square bg-slate-200 rounded-md mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-5 bg-slate-200 rounded w-5/6 mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                    </div>
                    <div className="h-8 bg-slate-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              // Premium Empty State Illustration
              <div className="bg-white rounded-lg border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                  <SlidersHorizontal className="w-10 h-10" />
                </div>
                <h4 className="text-slate-800 font-bold text-base mb-1">No Matches Found</h4>
                <p className="text-[#878787] text-xs max-w-sm mb-5 leading-normal">
                  Your search filters did not match any products in our catalog. Reset your criteria to explore our complete collection.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="bg-[#2874F0] hover:bg-[#1b62db] text-white text-xs font-bold px-6 py-2 rounded shadow cursor-pointer transition-colors"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              // Real Products Grid
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className={`p-2 rounded border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 ${
                        page === 1
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100"
                          : "bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const active = page === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded border text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? "bg-[#2874F0] text-white border-[#2874F0]"
                              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={page === pagination.totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className={`p-2 rounded border border-slate-200 text-xs font-bold transition-all flex items-center gap-1 ${
                        page === pagination.totalPages
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-100"
                          : "bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                      }`}
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* C. Mobile Filters Sidebar Overlay */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black z-40"
            ></motion.div>

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="font-bold text-slate-800 text-sm">Filters</span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">Price Limit</h4>
                  <input
                    type="range"
                    min="5000"
                    max="200000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#2874F0]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold mt-1">
                    <span>Min: ₹5,000</span>
                    <span className="text-[#2874F0]">Max: ₹{maxPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Brands</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2.5 text-xs text-slate-600">
                    {BRANDS.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandCheckbox(brand)}
                          className="rounded border-slate-300 text-[#2874F0] accent-[#2874F0]"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Customer rating */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Customer Rating</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    {[4, 3].map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mobileRating"
                          checked={minRating === r}
                          onChange={() => setMinRating(r)}
                          className="accent-[#2874F0]"
                        />
                        <span>{r}★ & above</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mobileRating"
                        checked={minRating === 0}
                        onChange={() => setMinRating(0)}
                        className="accent-[#2874F0]"
                      />
                      <span>All Ratings</span>
                    </label>
                  </div>
                </div>

                {/* Stock availability */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-3">Availability</h4>
                  <label className="flex items-center gap-2 text-slate-600 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-slate-300 text-[#2874F0] accent-[#2874F0]"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              {/* Sidebar Action button */}
              <div className="border-t border-slate-100 pt-4 flex gap-2">
                <button
                  onClick={() => {
                    resetAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 py-2 rounded text-slate-700 border border-slate-200 font-bold text-xs bg-slate-50"
                >
                  RESET
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2 rounded bg-[#2874F0] text-white font-bold text-xs shadow-sm"
                >
                  APPLY
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
