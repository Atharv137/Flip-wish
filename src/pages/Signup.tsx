import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Lock, Mail, User, ShoppingBag, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const { addToast } = useCartWishlist();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      addToast("Please fill in all fields", "warning");
      return;
    }

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      addToast("Password must be at least 6 characters", "warning");
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      addToast("Signup Successful! Welcome to FlipWish.", "success");
      navigate("/");
    } else {
      addToast(result.error || "Registration failed", "error");
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
        
        {/* Banner Section */}
        <div className="bg-[#2874F0] text-white p-8 md:w-2/5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold italic">Register</h2>
            <p className="text-xs text-slate-100 font-light mt-3 leading-relaxed">
              Sign up today to manage your persistent cart, active stock checklists, and receive real-time stock alerts.
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
            
            {/* Full Name field */}
            <div>
              <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#2874F0] focus:border-[#2874F0]"
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password field */}
            <div>
              <label className="block text-slate-500 font-semibold text-[11px] uppercase mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#2874F0] focus:border-[#2874F0]"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB641B] hover:bg-[#e0540d] text-white font-bold py-2 rounded text-sm transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <span>Registering...</span> : <span>SIGN UP</span>}
            </button>

          </form>

          {/* Login link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-slate-500 text-xs">
              Already have an account?{" "}
              <Link to="/login" className="text-[#2874F0] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
