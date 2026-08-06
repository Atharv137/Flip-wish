import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Product } from "../types";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, RefreshCw, Award, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { API_URL } from "../config";

interface Recommendation {
  name: string;
  reason: string;
  priceRange: string;
}

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wishlist, cart, addToWishlist, removeFromWishlist, addToCart, addToast } = useCartWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  // Fetch product detail
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          addToast("Product not found", "error");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 space-y-4">
            <div className="w-full aspect-square bg-slate-200 rounded-lg"></div>
            <div className="flex gap-2">
              <div className="w-20 h-20 bg-slate-200 rounded"></div>
              <div className="w-20 h-20 bg-slate-200 rounded"></div>
              <div className="w-20 h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="md:w-1/2 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-20 bg-slate-200 rounded w-full"></div>
            <div className="h-10 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Reactivity checking
  const wishlistItem = wishlist.find((item) => item.productId === product.id);
  const isWishlisted = !!wishlistItem;

  const cartItem = cart.find((item) => item.productId === product.id);
  const isInCart = !!cartItem;

  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      await removeFromWishlist(wishlistItem.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleCartAction = async () => {
    if (isInCart) {
      navigate("/cart");
    } else {
      await addToCart(product.id);
    }
  };

  const fetchRecommendations = async () => {
    if (!product) return;
    setIsRecommending(true);
    setRecommendations(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.title || product.name,
          category: product.category,
          price: product.price,
          description: product.description
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          addToast("Failed to parse recommendations", "error");
        }
      } else {
        addToast("Error contacting AI service", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch recommendations", "error");
    } finally {
      setIsRecommending(false);
    }
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Generate varied sub-images for gallery
  const galleryImages = [
    product.image,
    product.image + "&blur=1",
    product.image + "&sat=-50",
    product.image + "&hue=90"
  ];

  // Stock logic
  const isOutOfStock = product.stock === 0;
  const isFewLeft = product.stock > 0 && product.stock <= 3;

  // Render dummy specifications depending on category
  const renderSpecs = () => {
    const specs: Record<string, string> = {
      Brand: product.brand,
      Category: product.category,
      Model: product.title.split("(")[0].trim(),
      Warranty: "1 Year Manufacturer Warranty",
      "Package Contents": "Product Device, Charging Adapter, User Manual, Regulatory Pamphlet"
    };

    if (product.category === "Smartphones") {
      specs["Display"] = "6.7-inch Super Retina XDR AMOLED OLED";
      specs["Processor"] = "Deca-Core Hyper Gaming Chipset";
      specs["OS"] = "Modern Handset Operating System v18";
      specs["Memory"] = "12GB RAM, 256GB High-Speed Storage";
    } else if (product.category === "Laptops") {
      specs["Screen Size"] = "15.6-inch Quad-HD 165Hz IPS Display";
      specs["Processor"] = "Ultra Core System Pro i9 Octa-Core CPU";
      specs["Graphics"] = "Next-Gen Mobile RTX Graphics Core 12GB";
      specs["Battery Life"] = "Up to 12 Hours Battery Performance";
    } else {
      specs["Model Year"] = "2026 Latest Release Edition";
      specs["Connectivity"] = "Super Speed Bluetooth v5.4 & Dual-Band Wi-Fi 6";
    }

    return (
      <div className="border border-slate-100 rounded-lg overflow-hidden bg-white mt-6">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Product Specifications</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {Object.entries(specs).map(([key, val]) => (
            <div key={key} className="grid grid-cols-3 p-3.5 text-xs">
              <span className="text-[#878787] font-medium">{key}</span>
              <span className="col-span-2 text-slate-800 font-semibold">{val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      {/* Back to Products */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[#2874F0] hover:text-[#fb641b] text-xs font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          BACK TO ALL PRODUCTS
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-8">
          
          {/* A. Image gallery panel (Left) */}
          <div className="lg:w-1/2 flex flex-col md:flex-row gap-4 items-start shrink-0">
            {/* Thumbnail vertical column */}
            <div className="flex md:flex-col gap-2 order-2 md:order-1 w-full md:w-20 overflow-x-auto md:overflow-visible shrink-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`border-2 rounded p-1 aspect-square w-16 bg-white overflow-hidden shrink-0 cursor-pointer transition-all ${
                    activeImageIdx === idx ? "border-[#2874F0]" : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <img src={product.image} alt="thumb" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

            {/* Primary Main Image Container */}
            <div className="flex-1 order-1 md:order-2 w-full aspect-square border border-slate-50 bg-slate-50/20 rounded-lg flex items-center justify-center p-6 relative">
              <img
                src={product.image}
                alt={product.title}
                className="object-contain max-h-[350px] w-auto transition-transform hover:scale-105 duration-300"
                referrerPolicy="no-referrer"
              />

              {isOutOfStock && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                  <span className="bg-red-600 text-white text-sm font-extrabold px-6 py-2 rounded-lg shadow-lg">
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* B. Details panel (Right) */}
          <div className="flex-1 flex flex-col">
            
            {/* Brand heading */}
            <span className="text-xs font-semibold text-[#878787] tracking-widest uppercase mb-1">
              {product.brand}
            </span>

            {/* Title */}
            <h1 className="text-slate-900 text-lg md:text-2xl font-bold leading-snug mb-2">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-0.5">
                <span>{(product.rating ?? 0).toFixed(1)}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs text-[#878787] font-medium border-r border-slate-200 pr-3">
                {(product.reviews ?? 0).toLocaleString()} Ratings & Reviews
              </span>
              <span className="text-xs text-emerald-600 font-bold">
                100% Certified Assurance
              </span>
            </div>

            <hr className="border-slate-100 mb-4" />

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="text-slate-900 text-2xl font-extrabold">
                {formatPrice(product.price ?? 0)}
              </span>
              {(product.discount ?? 0) > 0 && (
                <>
                  <span className="text-[#878787] text-sm line-through">
                    {formatPrice(product.originalPrice ?? 0)}
                  </span>
                  <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-2.5 py-0.5 rounded">
                    {product.discount}% Off Special Discount
                  </span>
                </>
              )}
            </div>

            {/* Dynamic Stock Label (Requirement: Green for in-stock, Orange for few left, Red for out-of-stock) */}
            <div className="mb-4">
              {isOutOfStock ? (
                <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded border border-red-200/50 w-fit flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                  Out Of Stock (No inventory available)
                </div>
              ) : isFewLeft ? (
                <div className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded border border-amber-200/50 w-fit flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse"></span>
                  Only Few Left! (Just {product.stock} items remaining)
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded border border-emerald-200/50 w-fit flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  In Stock ({product.stock} units ready to ship)
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-slate-600 text-xs leading-relaxed mb-6 font-normal">
              <p className="font-bold text-slate-800 mb-1 text-xs">Product Description:</p>
              {product.description}
            </div>

            {/* Delivery banner */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#2874F0]" />
                <div>
                  <p className="text-slate-700 font-bold text-xs">Free Lightning Delivery</p>
                  <p className="text-[#878787] text-[10px]">Guaranteed arrival by {product.deliveryDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-slate-700 font-bold text-xs">100% Genuine Guarantee</p>
                  <p className="text-[#878787] text-[10px]">Direct brand authorized inventory matching</p>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                className={`flex-1 py-3 px-6 rounded text-sm font-bold flex items-center justify-center gap-2 shadow border transition-all cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{isWishlisted ? "WISHED" : "ADD TO WISHLIST"}</span>
              </button>

              {/* Cart Button */}
              <button
                disabled={isOutOfStock}
                onClick={handleCartAction}
                className={`flex-1 py-3 px-6 rounded text-sm font-bold flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
                  isOutOfStock
                    ? "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed shadow-none"
                    : isInCart
                    ? "bg-[#FFE500] hover:bg-[#ebd200] text-[#2874F0]"
                    : "bg-[#FB641B] hover:bg-[#e0540d] text-white"
                }`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span>{isOutOfStock ? "OUT OF STOCK" : isInCart ? "GO TO CART" : "ADD TO CART"}</span>
              </button>

            </div>

            {/* Specifications component */}
            {renderSpecs()}

            {/* AI Recommendations Button */}
            <div className="mt-8">
              <button
                onClick={fetchRecommendations}
                disabled={isRecommending}
                className={`w-full py-3 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow transition-all cursor-pointer border ${
                  isRecommending 
                    ? "bg-indigo-50 text-indigo-400 border-indigo-200 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-indigo-200 shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {isRecommending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing product...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    <span>AI Recommend Similar Products</span>
                  </>
                )}
              </button>
            </div>
            
          </div>

        </div>

        {/* AI Recommendations Display */}
        {recommendations && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-indigo-100"
          >
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">✨</span> AI Suggested Alternatives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 rounded-lg p-5 flex flex-col hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-slate-900 text-base mb-2">{rec.name}</h3>
                  <div className="bg-white rounded px-2.5 py-1 text-xs font-bold text-indigo-700 w-fit border border-indigo-100 mb-3">
                    Est. {rec.priceRange}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1">
                    <span className="font-semibold text-slate-700">Why?</span> {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
