import React from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartWishlistProvider } from "./context/CartWishlistContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/ToastContainer";

// Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ProductDetails } from "./pages/ProductDetails";
import { Wishlist } from "./pages/Wishlist";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { AdminDashboard } from "./pages/AdminDashboard";

import { motion, AnimatePresence } from "motion/react";

// Page animation wrapper
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartWishlistProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#F1F3F6] font-sans selection:bg-[#FFE500] selection:text-[#2874F0]">
            
            {/* 1. Global Navigation Bar */}
            <Navbar />

            {/* 2. Content view layout mapped inside Animated switchers */}
            <main className="flex-1 flex flex-col relative">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                  <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                  <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
                  <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
                  <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
                  <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
                  <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
                  <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                </Routes>
              </AnimatePresence>
            </main>

            {/* 3. Floating Custom Toast Notifications */}
            <ToastContainer />

            {/* 4. Global bottom footer details */}
            <Footer />

          </div>
        </Router>
      </CartWishlistProvider>
    </AuthProvider>
  );
}
