import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useSearchDebounce } from "../hooks/useSearchDebounce";
import { useAuth } from "../context/AuthContext";
import { useCartWishlist } from "../context/CartWishlistContext";
import { Heart, ShoppingCart, User, LogOut, LayoutDashboard, Search, ShoppingBag } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlist, cart } = useCartWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [profileOpen, setProfileOpen] = useState(false);
  
  const debouncedSearch = useSearchDebounce(searchVal, 600);

  useEffect(() => {
    // Automatically navigate on debounce
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch.trim() !== currentSearch) {
      if (debouncedSearch.trim()) {
        navigate(`/?search=${encodeURIComponent(debouncedSearch.trim())}`);
      } else if (debouncedSearch === "" && currentSearch !== "") {
        navigate("/");
      }
    }
  }, [debouncedSearch, navigate, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate("/");
    }
  };

  const handleLogoClick = () => {
    setSearchVal("");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#2874F0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer shrink-0">
            <div className="bg-[#FFE500] text-[#2874F0] p-1.5 rounded-lg font-bold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-xl tracking-tight italic">
                Flip<span className="text-[#FFE500]">Wish</span>
              </span>
              <span className="text-[10px] text-slate-100 font-medium italic flex items-center gap-0.5 mt-0.5">
                Explore <span className="text-[#FFE500] font-bold">Plus ◆</span>
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative hidden sm:block">
            <input
              type="text"
              placeholder="Search for products, brands and categories..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 pl-4 pr-10 py-2 rounded shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE500] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2874F0] cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

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
                <span className="absolute -top-1 -right-2.5 bg-[#FB641B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2874F0] animate-pulse">
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
                <span className="absolute -top-1 -right-2.5 bg-[#FB641B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2874F0]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="bg-white text-[#2874F0] hover:bg-slate-5 px-4 py-1.5 rounded font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all focus:outline-none cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{user?.name}</span>
                </button>

                {profileOpen && (
                  <>
                    {/* Overlay to close menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-lg shadow-xl py-1 border border-slate-100 z-50 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 text-slate-700 hover:text-[#2874F0] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Admin Dashboard
                      </Link>

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
                className="bg-white text-[#2874F0] hover:bg-slate-5 px-6 py-1.5 rounded font-extrabold text-sm shadow-sm transition-all text-center block"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar Row */}
      <div className="sm:hidden px-4 pb-3 pt-1 border-t border-[#1b62db]">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search for products, brands..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 pl-4 pr-10 py-1.5 rounded shadow-inner text-xs focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </nav>
  );
};
