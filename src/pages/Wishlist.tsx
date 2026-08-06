import React from "react";
import { Link } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Heart, Trash2, ShoppingCart, Star, Sparkles, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Wishlist: React.FC = () => {
  const { wishlist, loading, removeFromWishlist, moveToCart } = useCartWishlist();

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#2874F0] animate-spin" />
        <span className="text-xs text-slate-500 font-medium mt-3">Loading your wishlist...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header summary */}
        <div className="bg-white p-4 rounded-t-lg border-b border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>My Wishlist ({wishlist.length} Items)</span>
            </h1>
            <p className="text-[#878787] text-xs font-light mt-0.5">
              Active stock status is audited automatically every 30 seconds.
            </p>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-emerald-600" />
            Stock Synced Live
          </div>
        </div>

        {/* Content list */}
        <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-slate-100 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {wishlist.length === 0 ? (
              // Premium empty state
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                  <Heart className="w-10 h-10" />
                </div>
                <h4 className="text-slate-800 font-bold text-base mb-1">Your Wishlist is Empty!</h4>
                <p className="text-[#878787] text-xs max-w-sm mb-6 leading-normal">
                  Explore our premium electronics catalog and save your favorite flagships, laptops, and wearables for smart monitoring.
                </p>
                <Link
                  to="/"
                  className="bg-[#2874F0] hover:bg-[#1b62db] text-white text-xs font-bold px-8 py-2.5 rounded shadow cursor-pointer transition-colors"
                >
                  START SHOPPING
                </Link>
              </motion.div>
            ) : (
              // Wishlist rows
              <div className="divide-y divide-slate-100">
                {wishlist.map((item) => {
                  const isOutOfStock = item.product.stock === 0;
                  const isFewLeft = item.product.stock > 0 && item.product.stock <= 3;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                      layout
                      className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      
                      {/* Product details */}
                      <Link
                        to={`/product/${item.productId}`}
                        className="flex gap-4 flex-1 items-center cursor-pointer hover:opacity-95"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 p-2 rounded flex items-center justify-center shrink-0 relative">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="object-contain max-h-full w-auto"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center rounded">
                              <span className="bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                                OOS
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title, Brand, Rating and Price */}
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {item.product.brand}
                          </span>
                          <h3 className="text-slate-800 text-sm font-medium line-clamp-1 leading-snug">
                            {item.product.title}
                          </h3>

                          {/* Rating and stars */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="bg-emerald-600 text-white text-[10px] font-bold px-1.2 py-0.2 rounded flex items-center gap-0.5">
                              <span>{(item.product?.rating ?? 0).toFixed(1)}</span>
                              <Star className="w-2.5 h-2.5 fill-white" />
                            </div>
                            <span className="text-[11px] text-[#878787] font-medium">
                              ({(item.product?.reviews ?? 0).toLocaleString()} ratings)
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-slate-900 text-sm font-bold">
                              {formatPrice(item.product?.price ?? 0)}
                            </span>
                            {(item.product?.discount ?? 0) > 0 && (
                              <>
                                <span className="text-[#878787] text-xs line-through">
                                  {formatPrice(item.product?.originalPrice ?? 0)}
                                </span>
                                <span className="text-emerald-600 text-xs font-bold">
                                  {item.product?.discount}% off
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Stock status indicator (Requirement: Green, Orange, Red) */}
                      <div className="w-full sm:w-auto shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                        <div className="text-right">
                          {isOutOfStock ? (
                            <span className="bg-red-50 text-red-600 border border-red-200/50 text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              Out Of Stock
                            </span>
                          ) : isFewLeft ? (
                            <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                              Only {item.product.stock} Left
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              In Stock
                            </span>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            Delivery in {item.product.deliveryDate}
                          </p>
                        </div>

                        {/* Row with action triggers */}
                        <div className="flex items-center gap-2">
                          {/* Remove button */}
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer shadow-sm"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>

                          {/* Move to Cart button (Optimistic execution) */}
                          <button
                            disabled={isOutOfStock}
                            onClick={() => moveToCart(item)}
                            className={`px-4 py-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              isOutOfStock
                                ? "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed shadow-none"
                                : "bg-[#FB641B] hover:bg-[#e0540d] text-white"
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>MOVE TO CART</span>
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
