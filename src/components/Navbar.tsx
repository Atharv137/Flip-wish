import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Heart, ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { ProductSearchBar } from "./ProductSearchBar";

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlist, cart } = useCartWishlist();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const isAdmin = Boolean(user && (user.email?.toLowerCase() === "hargudetejas17@gmail.com" || user.role === "admin"));

  return (
    <nav className="sticky top-0 z-40 bg-[#7C3AED] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer shrink-0">
            <div className="bg-[#FFE500] text-[#7C3AED] p-1.5 rounded-lg font-bold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-xl tracking-tight italic">
                Electro<span className="text-[#FFE500]">mart</span>
              </span>
              <span className="text-[10px] text-slate-100 font-medium italic flex items-center gap-0.5 mt-0.5">
                Explore <span className="text-[#FFE500] font-bold">Plus ◆</span>
              </span>
            </div>
          </div>

          {/* Desktop Search Bar with Search History */}
          <ProductSearchBar
            variant="desktop"
            placeholder="Search for products, brands and categories..."
            className="flex-1 max-w-xl hidden sm:block"
          />

          {/* Action Links */}
          <div className="flex items-center gap-6 shrink-0">
            
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative flex items-center gap-2 text-white hover:text-[#FFE500] transition-colors py-2"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm font-semibold hidden md:inline">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-[#FB641B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#7C3AED] animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 text-white hover:text-[#FFE500] transition-colors py-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-semibold hidden md:inline">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-[#FB641B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#7C3AED]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="bg-white text-[#7C3AED] hover:bg-slate-50 px-4 py-1.5 rounded font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all focus:outline-none cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{user?.name}</span>
                </button>

                {profileOpen && (
                  <>
                    {/* Overlay to close menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-2 w-52 bg-white text-slate-800 rounded-lg shadow-xl py-1 border border-slate-100 z-50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[11px] text-slate-400">Signed in as</p>
                          {isAdmin ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Admin
                            </span>
                          ) : (
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Shopper
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 hover:text-[#7C3AED] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-red-50 text-rose-600 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-[#7C3AED] hover:bg-slate-50 px-6 py-1.5 rounded font-extrabold text-sm shadow-sm transition-all text-center block"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar Row with Search History */}
      <div className="sm:hidden px-4 pb-3 pt-1 border-t border-[#6D28D9]">
        <ProductSearchBar
          variant="mobile"
          placeholder="Search for products, brands..."
          className="w-full"
        />
      </div>
    </nav>
  );
};
