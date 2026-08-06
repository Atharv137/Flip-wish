import { Request, Response } from "express";
import Wishlist from "../../models/Wishlist.js";
import Product from "../../models/Product.js";

export async function getWishlist(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    
    // Fetch and populate product info
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate("product");

    return res.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ error: "Internal server error fetching wishlist" });
  }
}

export async function addToWishlist(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: userId, product: productId });
    if (existing) {
      return res.status(200).json({ message: "Product is already in wishlist", wishlist: existing });
    }

    const newWish = new Wishlist({ user: userId, product: productId });
    await newWish.save();
    
    return res.status(201).json({
      message: "Added to wishlist",
      wishlist: newWish
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({ error: "Internal server error adding to wishlist" });
  }
}

export async function removeFromWishlist(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params; // Can be Wishlist Record ID or Product ID

    // Try finding by Wishlist ID
    let wish = await Wishlist.findOne({ _id: id, user: userId });
    
    // If not found, try finding by Product ID
    if (!wish) {
      wish = await Wishlist.findOne({ product: id, user: userId });
    }

    if (!wish) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    await Wishlist.findByIdAndDelete(wish._id);
    return res.status(200).json({ message: "Removed from wishlist", id: wish._id, productId: wish.product });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({ error: "Internal server error removing from wishlist" });
  }
}

export async function checkWishlistStock(req: Request, res: Response): Promise<any> {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: "Product IDs array is required" });
    }

    const stockMap: Record<string, { stock: number; price: number; originalPrice: number }> = {};
    
    const products = await Product.find({ _id: { $in: productIds } });
    
    products.forEach((product: any) => {
      stockMap[product._id.toString()] = {
        stock: product.stock,
        price: product.price,
        originalPrice: product.originalPrice
      };
    });

    return res.status(200).json({ stockMap });
  } catch (error) {
    console.error("Check stock error:", error);
    return res.status(500).json({ error: "Internal server error checking stock levels" });
  }
}
