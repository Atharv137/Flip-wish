import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Lock, Mail, ShoppingBag, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useCartWishlist();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("Please fill in all fields", "warning");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      addToast("Login Successful! Welcome back.", "success");
      navigate("/");
    } else {
      addToast(result.error || "Invalid credentials", "error");
    }
  };

  return (
    <div className="bg-[#F1F3F6] min-h-[calc(screen-16rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden border border-slate-100 flex flex-col md:flex-row"
      >
        
        {/* Banner Section (Flipkart Blue Banner) */}
        <div className="bg-[#2874F0] text-white p-8 md:w-2/5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold italic">Login</h2>
            <p className="text-xs text-slate-100 font-light mt-3 leading-relaxed">
              Get access to your Orders, Wishlist, Recommendations, and active stock monitoring alerts!
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 opacity-90 mt-10">
            <ShoppingBag className="w-6 h-6 text-[#FFE500]" />
            <span className="font-extrabold text-sm italic">
              Flip<span className="text-[#FFE500]">Wish</span>
            </span>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email field */}
            <div>
              <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#2874F0] focus:border-[#2874F0]"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#2874F0] focus:border-[#2874F0]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Extra Row */}
            <div className="flex items-center justify-between text-xs font-medium">
              <label className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#2874F0] focus:ring-[#2874F0] w-3.5 h-3.5 accent-[#2874F0]"
                />
                <span>Remember Me</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  addToast("Demo mode: Please register a new account if you forgot your credentials.", "info");
                }}
                className="text-[#2874F0] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB641B] hover:bg-[#e0540d] text-white font-bold py-2 rounded text-sm transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>LOG IN</span>
                </>
              )}
            </button>

          </form>

          {/* Create account link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-slate-500 text-xs">
              New to FlipWish?{" "}
              <Link to="/signup" className="text-[#2874F0] font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Quick Demo Login details */}
          <div className="mt-5 bg-slate-50 border border-slate-100 rounded p-3 text-[11px] text-slate-500">
            <p className="font-bold text-slate-600 mb-1">Quick Demo Note:</p>
            <p>You can sign up directly. Or use our sample administrator details for instant testing:</p>
            <div className="mt-1 font-mono text-slate-700 bg-white p-1.5 rounded border border-slate-200/50 flex flex-col gap-0.5">
              <span>Email: admin@flipwish.com</span>
              <span>Pass: admin123</span>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
