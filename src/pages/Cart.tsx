import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Cart: React.FC = () => {
  const { cart, loading, updateCartQuantity, removeFromCart, addToast } = useCartWishlist();
  const navigate = useNavigate();

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculations
  const totalOriginalPrice = cart.reduce((sum, item) => sum + (item.product?.originalPrice ?? 0) * (item.quantity ?? 1), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + ((item.product?.originalPrice ?? 0) - (item.product?.price ?? 0)) * (item.quantity ?? 1), 0);
  const subtotal = totalOriginalPrice - totalDiscount;
  const deliveryCharges = subtotal > 500 ? 0 : 40; // Free delivery above 500
  const finalTotal = subtotal + deliveryCharges;

  const handleQtyChange = async (cartItemId: string, currentQty: number, change: number, stockLimit: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      // Remove item if quantity goes below 1
      await removeFromCart(cartItemId);
      return;
    }

    if (newQty > stockLimit) {
      addToast(`Only ${stockLimit} items available in stock`, "warning");
      return;
    }

    await updateCartQuantity(cartItemId, newQty);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#2874F0] animate-spin" />
        <span className="text-xs text-slate-500 font-medium mt-3">Loading your shopping cart...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {cart.length === 0 ? (
          // Premium Empty Cart Illustration
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h4 className="text-slate-800 font-bold text-base mb-1">Your Shopping Cart is Empty!</h4>
            <p className="text-[#878787] text-xs max-w-sm mb-6 leading-normal">
              Browse our catalog of premium smartphones, sleek notebooks, and tech wearables to fill your basket.
            </p>
            <Link
              to="/"
              className="bg-[#2874F0] hover:bg-[#1b62db] text-white text-xs font-bold px-8 py-2.5 rounded shadow cursor-pointer transition-colors"
            >
              EXPLORE OFFERS
            </Link>
          </motion.div>
        ) : (
          // Cart Items and Price summary
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Panel: Items List */}
            <div className="flex-1 w-full bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h1 className="text-slate-800 font-bold text-sm">
                  FlipWish Shopping Cart ({cart.length} Items)
                </h1>
              </div>

              <div className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                      layout
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      {/* Product details */}
                      <div className="flex gap-4 items-center flex-1">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded p-2 flex items-center justify-center shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            referrerPolicy="no-referrer"
                            className="object-contain max-h-full w-auto"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {item.product.brand}
                          </span>
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-slate-800 text-sm font-medium line-clamp-1 hover:text-[#2874F0] leading-snug transition-colors block"
                          >
                            {item.product.title}
                          </Link>
                          
                          {/* Price */}
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-slate-900 text-sm font-bold">
                              {formatPrice(item.product?.price ?? 0)}
                            </span>
                            {(item.product?.discount ?? 0) > 0 && (
                              <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                                {item.product?.discount}% Off
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-400 mt-1">
                            Seller: FlipWish Retail Core Authorized
                          </p>
                        </div>
                      </div>

                      {/* Controls and quantity triggers */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 shrink-0">
                        
                        {/* Quantity triggers row */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Qty:</span>
                          <div className="flex items-center border border-slate-200 rounded overflow-hidden shadow-inner">
                            <button
                              onClick={() => handleQtyChange(item.id, item.quantity, -1, item.product.stock)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3.5 text-xs text-slate-800 font-bold text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item.id, item.quantity, 1, item.product.stock)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50/50 rounded transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden md:inline">REMOVE</span>
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Secure guarantee banner */}
              <div className="p-4 bg-emerald-50/20 border-t border-slate-50 flex items-center gap-2.5 text-emerald-700 font-semibold text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Safe and Secure Payments. 100% Buyer Protection Guarantee.</span>
              </div>
            </div>

            {/* Right Panel: Price Summary Sidebar */}
            <aside className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-slate-100 p-5 shrink-0">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                Price Details
              </h2>

              <div className="space-y-3.5 text-xs font-medium text-slate-600 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Price ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-slate-800">{formatPrice(totalOriginalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount Savings</span>
                  <span className="text-emerald-600">-{formatPrice(totalDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>
                    {deliveryCharges === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatPrice(deliveryCharges)
                    )}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center py-4 border-b border-slate-100 text-slate-900 font-bold text-sm mb-4">
                <span>Total Amount</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              {/* Savings callout */}
              {totalDiscount > 0 && (
                <p className="text-emerald-600 text-xs font-bold mb-5 bg-emerald-50 p-2.5 rounded text-center leading-normal">
                  You will save {formatPrice(totalDiscount)} on this order! 🎉
                </p>
              )}

              {/* Place Order CTA */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-[#FB641B] hover:bg-[#e0540d] text-white font-bold py-3 rounded flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-sm"
              >
                <span>PLACE ORDER</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </aside>

          </div>
        )}

      </div>
    </div>
  );
};
