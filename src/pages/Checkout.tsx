import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartWishlist } from "../context/CartWishlistContext";
import { MapPin, Phone, User, Home, ArrowLeft, CheckCircle2, ShoppingBag, CreditCard, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export const Checkout: React.FC = () => {
  const { cart, checkoutCart, addToast } = useCartWishlist();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isPlaced, setIsPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculations
  const totalOriginalPrice = cart.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.product.originalPrice - item.product.price) * item.quantity, 0);
  const subtotal = totalOriginalPrice - totalDiscount;
  const deliveryCharges = subtotal > 500 ? 0 : 40;
  const finalTotal = subtotal + deliveryCharges;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !pincode || !address || !city || !state) {
      addToast("Please fill in all address fields", "warning");
      return;
    }

    if (phone.length < 10) {
      addToast("Please enter a valid 10-digit phone number", "warning");
      return;
    }

    setLoading(true);
    const success = await checkoutCart();
    setLoading(false);

    if (success) {
      setIsPlaced(true);
    }
  };

  if (isPlaced) {
    return (
      <div className="bg-[#F1F3F6] min-h-[calc(screen-16rem)] py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center border border-slate-100 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-700" />
            ORDER PLACED SUCCESSFULLY
          </span>

          <h2 className="text-slate-800 font-extrabold text-xl leading-tight">
            Thank you for your purchase!
          </h2>
          <p className="text-slate-400 text-xs mt-2 max-w-sm font-normal">
            Your payment was authorized and your order is currently being prepared for shipping. We sent an confirmation details to your registered email address.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 w-full my-6 text-left text-xs font-medium text-slate-600 space-y-2">
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="font-bold text-slate-700">Shipping To:</span>
              <span className="text-slate-800 font-semibold">{name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="font-bold text-slate-700">Contact:</span>
              <span className="text-slate-800 font-semibold">{phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="font-bold text-slate-700">Address:</span>
              <span className="text-slate-800 font-semibold truncate max-w-[200px]">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">Total Paid:</span>
              <span className="text-slate-900 font-extrabold">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <Link
              to="/"
              className="flex-1 bg-[#2874F0] hover:bg-[#1b62db] text-white font-bold py-2.5 rounded text-xs shadow-sm transition-colors block text-center"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-[#F1F3F6] min-h-screen py-12 text-center">
        <h3 className="text-slate-800 font-bold text-sm mb-2">No active items found</h3>
        <p className="text-[#878787] text-xs mb-4">Please add items to your cart before checking out.</p>
        <Link to="/" className="bg-[#2874F0] text-white text-xs font-bold px-4 py-2 rounded">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-[#2874F0] hover:text-[#fb641b] text-xs font-bold transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          RETURN TO SHOPPING CART
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left panel: Address form & Summary */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Delivery address card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-5">
              <h2 className="text-slate-800 font-extrabold text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2874F0]" />
                1. Delivery Address details
              </h2>

              <form onSubmit={handleSubmitOrder} id="checkout-form" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="col-span-1">
                  <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                    Receiver Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Receiver Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="col-span-1">
                  <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                      required
                    />
                  </div>
                </div>

                {/* PIN and State */}
                <div>
                  <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                    Postal PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit PIN code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Karnataka, Maharashtra etc"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                    required
                  />
                </div>

                {/* Address full line */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                    Street Address / House Flat Number
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Apartment name, street, locality"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Bengaluru, Pune etc"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                    required
                  />
                </div>

              </form>
            </div>

            {/* Order summary listing */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-5">
              <h2 className="text-slate-800 font-extrabold text-sm mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2874F0]" />
                2. Order Summary
              </h2>

              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-slate-50 rounded border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <img src={item.product.image} alt={item.product.title} className="object-contain max-h-full" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="text-slate-800 font-bold text-xs line-clamp-1">{item.product.title}</h4>
                        <p className="text-[#878787] text-[10px]">Qty: {item.quantity} x {formatPrice(item.product.price)}</p>
                      </div>
                    </div>
                    <span className="text-slate-900 font-extrabold text-xs">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: Price summary sidebar */}
          <aside className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-slate-100 p-5 shrink-0">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Price Details
            </h2>

            <div className="space-y-3.5 text-xs font-medium text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Original Price</span>
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

            {/* Final grand total */}
            <div className="flex justify-between items-center py-4 border-b border-slate-100 text-slate-900 font-bold text-sm mb-4">
              <span>Grand Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            {/* Payment Method callout */}
            <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-150 text-[11px] text-slate-500 space-y-1.5 font-medium">
              <p className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-[#2874F0]" />
                Selected Payment Mode
              </p>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-bold">
                <input type="radio" checked readOnly className="accent-[#2874F0]" />
                Cash On Delivery (COD) / Pay on Arrival
              </label>
              <p className="font-light text-slate-400">Due to sandboxed simulation bounds, Cod is currently the exclusive activated gateway.</p>
            </div>

            {/* Main Submit Button triggers Address Form submit */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-[#FB641B] hover:bg-[#e0540d] text-white font-bold py-3 rounded flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-sm"
            >
              {loading ? <span>PROCESSING ORDER...</span> : <span>PLACE YOUR ORDER</span>}
            </button>
          </aside>

        </div>
      </div>
    </div>
  );
};
