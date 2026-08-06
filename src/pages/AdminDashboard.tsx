import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { useCartWishlist } from "../context/CartWishlistContext";
import { API_URL } from "../config";
import { LayoutDashboard, Plus, Pencil, Trash2, CheckCircle, Package, AlertTriangle, Image as ImageIcon, Search, RefreshCw, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = [
  "Smartphones",
  "Laptops",
  "Tablets",
  "Smart Watches",
  "Earbuds",
  "Headphones",
  "Cameras",
  "Gaming Consoles",
  "Monitors",
  "Speakers",
  "Keyboards",
  "Mouse"
];

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "OnePlus",
  "Nothing",
  "Dell",
  "ASUS",
  "Acer",
  "Lenovo",
  "Sony",
  "Canon",
  "Microsoft",
  "LG",
  "Logitech",
  "JBL"
];

export const AdminDashboard: React.FC = () => {
  const { addToast } = useCartWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for Add/Edit
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [category, setCategory] = useState("Smartphones");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  // Statistics
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products?limit=100`); // fetch all
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products on Admin Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Reset form
  const resetForm = () => {
    setTitle("");
    setBrand("Apple");
    setCategory("Smartphones");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setStock("");
    setImage("");
    setEditingProduct(null);
  };

  // Open Edit Form pre-populated
  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setBrand(p.brand);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(String(p.price));
    setOriginalPrice(String(p.originalPrice));
    setStock(String(p.stock));
    setImage(p.image);
    setShowAddForm(false);
  };

  // Form submission: Create or Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !price || !originalPrice || stock === "") {
      addToast("Please fill in required fields", "warning");
      return;
    }

    const payload = {
      title,
      brand,
      category,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice),
      stock: Number(stock),
      image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"
    };

    try {
      const token = localStorage.getItem("flipkart_token");
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        addToast(editingProduct ? "Product updated successfully!" : "Product created successfully!", "success");
        if (editingProduct && payload.stock !== editingProduct.stock) {
          addToast("Stock updated! Synchronizing users' wishlists...", "info");
        }
        resetForm();
        setShowAddForm(false);
        await fetchAllProducts();
      } else {
        addToast(data.error || "Save operation failed", "error");
      }
    } catch (err) {
      addToast("Network error. Could not save product.", "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action is irreversible.")) {
      return;
    }

    try {
      const token = localStorage.getItem("flipkart_token");
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        addToast("Product deleted successfully!", "success");
        await fetchAllProducts();
      } else {
        addToast(data.error || "Delete operation failed", "error");
      }
    } catch (err) {
      addToast("Network error. Could not delete product.", "error");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#F1F3F6] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        
        {/* Page title */}
        <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2874F0]/10 rounded text-[#2874F0]">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-slate-800 font-extrabold text-base leading-tight">Admin Catalog Dashboard</h1>
              <p className="text-[#878787] text-xs font-light mt-0.5">
                Manage electronic inventories, prices, photos, and stock counts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAllProducts}
              className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              title="Refresh lists"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="bg-[#2874F0] hover:bg-[#1b62db] text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddForm ? "CLOSE FORM" : "ADD NEW PRODUCT"}</span>
            </button>
          </div>
        </div>

        {/* Sync Auditing Notification */}
        <div className="bg-blue-50 border-l-4 border-[#2874F0] p-4 rounded-r-lg mb-6 shadow-sm flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-[#2874F0] shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 font-medium leading-relaxed">
            <p className="font-bold text-blue-900 text-xs mb-0.5">Stock Synchronization Rules:</p>
            Any modifications to stock counts made on this page are pushed automatically to clients. Clients' smart wishlists check stock for saved elements only every 30 seconds using optimized endpoints, refreshing user interfaces in real-time.
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total products */}
          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-[#2874F0]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[#878787] text-[10px] uppercase font-bold tracking-wider">Total Products</p>
              <h3 className="text-slate-800 text-lg font-extrabold mt-0.5">{totalProducts} Items</h3>
            </div>
          </div>

          {/* Out of stock */}
          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[#878787] text-[10px] uppercase font-bold tracking-wider">Out Of Stock</p>
              <h3 className="text-slate-800 text-lg font-extrabold mt-0.5 text-rose-600">{outOfStockCount} Items</h3>
            </div>
          </div>

          {/* Low stock */}
          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[#878787] text-[10px] uppercase font-bold tracking-wider">Low Stock (1-3 left)</p>
              <h3 className="text-slate-800 text-lg font-extrabold mt-0.5 text-amber-600">{lowStockCount} Items</h3>
            </div>
          </div>
        </div>

        {/* Double-Panel Grid: Add/Edit Form + Product Manager */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Panel A: Add or Edit Form */}
          <AnimatePresence mode="wait">
            {(showAddForm || editingProduct) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full lg:w-96 bg-white rounded-lg p-5 border border-slate-100 shadow-sm shrink-0"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5">
                    <Package className="w-4.5 h-4.5 text-[#2874F0]" />
                    {editingProduct ? "Edit Product Details" : "Create New Product"}
                  </h3>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddForm(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                  {/* Title */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Apple iPhone 16 Pro (Black, 128 GB)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                      required
                    />
                  </div>

                  {/* Brand & Category row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Brand</label>
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 focus:outline-none"
                      >
                        {BRANDS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price & Original Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Sale Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Original Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="M.R.P."
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Stock count */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Current Stock *</label>
                    <input
                      type="number"
                      placeholder="Quantity in warehouse"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Setting stock to 0 triggers Out Of Stock labels inside users' wishlists.</p>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="Unsplash / standard web URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wide">Description</label>
                    <textarea
                      placeholder="Product description overview"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-slate-800 placeholder-slate-400 h-20 focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Save button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase transition-all shadow shadow-emerald-600/10 cursor-pointer"
                  >
                    {editingProduct ? "SAVE CHANGES" : "CREATE COMPONENT"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Panel B: Product Manager (Right list) */}
          <div className="flex-1 w-full bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Search list header */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <span className="font-bold text-slate-800 text-sm">Products Directory</span>
              
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search directory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                />
              </div>
            </div>

            {/* Product items list */}
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                Loading products directory...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 font-medium">
                No matching products found in the directory.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 font-medium min-w-[600px]">
                  <thead className="bg-slate-50/30 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Item details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Price</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-normal">
                    {filteredProducts.map((p) => {
                      const isOos = p.stock === 0;
                      const isLow = p.stock > 0 && p.stock <= 3;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Image and name */}
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-slate-100 p-1 bg-white shrink-0 flex items-center justify-center">
                              <img src={p.image} alt="pic" className="object-contain max-h-full" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 max-w-[200px] truncate">{p.title}</p>
                              <p className="text-[10px] text-slate-400 font-light">Brand: {p.brand} | ID: {p.id}</p>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4 text-slate-500 font-semibold">{p.category}</td>

                          {/* Price */}
                          <td className="p-4 text-right">
                            <p className="font-bold text-slate-800">{formatPrice(p.price)}</p>
                            <p className="text-[9px] text-[#878787] line-through">{formatPrice(p.originalPrice)}</p>
                          </td>

                          {/* Stock */}
                          <td className="p-4 text-center">
                            {isOos ? (
                              <span className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded border border-rose-100 text-[10px]">
                                0 (OOS)
                              </span>
                            ) : isLow ? (
                              <span className="bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded border border-amber-100 text-[10px] animate-pulse">
                                {p.stock} (LOW)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                                {p.stock} (OK)
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 rounded border border-slate-200 text-slate-500 hover:text-[#2874F0] hover:bg-[#2874F0]/5 transition-colors cursor-pointer inline-flex shadow-sm bg-white"
                              title="Edit product"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded border border-slate-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer inline-flex shadow-sm bg-white"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
