import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, cart, addToWishlist, removeFromWishlist, addToCart } = useCartWishlist();
  const navigate = useNavigate();

  // Check if item is already in wishlist
  const wishlistItem = wishlist.find((item) => item.productId === product.id);
  const isWishlisted = !!wishlistItem;

  // Check if item is already in cart
  const cartItem = cart.find((item) => item.productId === product.id);
  const isInCart = !!cartItem;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      await removeFromWishlist(wishlistItem.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCart) {
      navigate("/cart");
    } else {
      await addToCart(product.id);
    }
  };

  // The formatProductPrice function is called here before it is defined below,
  // demonstrating JavaScript function declaration hoisting.
  const priceFormatted = formatProductPrice(product.price ?? 0);
  const originalPriceFormatted = formatProductPrice(product.originalPrice ?? 0);

  // Determine stock labels
  const isOutOfStock = product.stock === 0;
  const isFewLeft = product.stock > 0 && product.stock <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-lg border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full overflow-hidden"
    >
      
      {/* Wishlist Icon */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-slate-400 hover:text-slate-600 p-2 rounded-full shadow border border-slate-100/50 transition-colors cursor-pointer"
      >
        <Heart
          className={`w-4.5 h-4.5 transition-all duration-300 ${
            isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400 group-hover:scale-105"
          }`}
        />
      </button>

      {/* Main Card Content */}
      <Link to={`/product/${product.id}`} className="p-4 flex-1 flex flex-col cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square w-full flex items-center justify-center bg-slate-50/20 rounded-md overflow-hidden mb-3.5">
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="object-contain max-h-[170px] w-auto transition-transform duration-500 group-hover:scale-105"
          />

          {/* Stock Badges */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded shadow">
                OUT OF STOCK
              </span>
            </div>
          )}

          {!isOutOfStock && isFewLeft && (
            <div className="absolute top-2 left-2">
              <span className="bg-[#FB641B] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                ONLY {product.stock} LEFT
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col">
          {/* Brand */}
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-0.5">
            {product.brand}
          </span>

          {/* Title */}
          <h4 className="text-slate-800 text-sm font-medium line-clamp-2 hover:text-[#2874F0] leading-snug mb-1.5 transition-colors">
            {product.title}
          </h4>

          {/* Rating Pill */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="bg-emerald-600 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 leading-none">
              <span>{(product.rating ?? 0).toFixed(1)}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-[11px] text-[#878787] font-medium">
              ({(product.reviews ?? 0).toLocaleString()} reviews)
            </span>
          </div>

          {/* Price Layout */}
          <div className="mt-auto flex items-baseline gap-2 flex-wrap">
            <span className="text-slate-900 text-base font-bold">
              {priceFormatted}
            </span>
            {(product.discount ?? 0) > 0 && (
              <>
                <span className="text-[#878787] text-xs line-through">
                  {originalPriceFormatted}
                </span>
                <span className="text-emerald-600 text-xs font-bold">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {/* Delivery Note */}
          <div className="mt-2 text-[10px] text-emerald-600 font-semibold bg-emerald-50/50 py-0.5 px-2 rounded w-fit">
            Free Delivery by {product.deliveryDate}
          </div>
        </div>
      </Link>

      {/* Button Row */}
      <div className="px-4 pb-4 border-t border-slate-50 pt-3 bg-slate-50/30">
        <button
          disabled={isOutOfStock}
          onClick={handleCartClick}
          className={`w-full text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              : isInCart
              ? "bg-[#FFE500] hover:bg-[#ebd200] text-[#2874F0]"
              : "bg-[#FB641B] hover:bg-[#e0540d] text-white"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isInCart ? "GO TO CART" : "ADD TO CART"}</span>
        </button>
      </div>

    </motion.div>
  );
};

// JavaScript Concept: Hoisting
// Function declarations are hoisted to the top of their scope,
// allowing them to be safely called before they are defined in the code.
function formatProductPrice(num: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
}
