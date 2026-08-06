import { Request, Response } from "express";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import mongoose from "mongoose";

export async function getCart(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    
    // Fetch and populate product info
    const populated = await Cart.find({ user: userId }).populate("product");

    // Add aggregation pipeline to calculate total quantity in cart
    const aggregationResult = await Cart.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$user", totalQuantity: { $sum: "$quantity" } } }
    ]);
    const totalQuantity = aggregationResult.length > 0 ? aggregationResult[0].totalQuantity : 0;

    return res.status(200).json({
      cartItems: populated,
      summary: {
        totalQuantity
      }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ error: "Internal server error fetching cart" });
  }
}

export async function addToCart(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product: any = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" }); // Fixed from 444 to 404
    }

    if (product.stock <= 0) {
      return res.status(400).json({ error: "Out Of Stock" });
    }

    // Check if item is already in cart
    const existing = await Cart.findOne({ user: userId, product: productId });
    
    if (existing) {
      const newQuantity = (existing.quantity || 1) + Number(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({
          error: `Cannot add more items. Only ${product.stock} left in stock.`
        });
      }
      existing.quantity = newQuantity;
      await existing.save();
      return res.status(200).json({
        message: "Cart updated",
        cartItem: existing
      });
    }

    if (Number(quantity) > product.stock) {
      return res.status(400).json({
        error: `Cannot add requested quantity. Only ${product.stock} available.`
      });
    }

    const newCartItem = new Cart({
      user: userId,
      product: productId,
      quantity: Number(quantity)
    });
    await newCartItem.save();

    return res.status(201).json({
      message: "Added to cart",
      cartItem: newCartItem
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ error: "Internal server error adding to cart" });
  }
}

export async function updateCartItem(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than zero" });
    }

    const cartItem = await Cart.findOne({ _id: id, user: userId });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const product: any = await Product.findById(cartItem.product);
    if (!product) {
      return res.status(404).json({ error: "Product associated with cart item not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ error: "Product is out of stock." });
    }

    if (Number(quantity) > product.stock) {
      return res.status(400).json({
        error: `Only ${product.stock} items available in stock`
      });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();

    return res.status(200).json({
      message: "Cart item updated",
      cartItem
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ error: "Internal server error updating cart item" });
  }
}

export async function deleteCartItem(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const cartItem = await Cart.findOneAndDelete({ _id: id, user: userId });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    return res.status(200).json({ message: "Item removed from cart", id });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return res.status(500).json({ error: "Internal server error deleting cart item" });
  }
}

export async function checkout(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const cartItems = await Cart.find({ user: userId });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const failedItems: string[] = [];
    for (const item of cartItems) {
      const product: any = await Product.findById(item.product);
      if (!product || product.stock < (item.quantity || 1)) {
        failedItems.push(product ? product.title || product.name : "Unknown item");
      }
    }

    if (failedItems.length > 0) {
      return res.status(400).json({
        error: `Stock changed during checkout. The following items are out of stock or have insufficient stock: ${failedItems.join(", ")}`
      });
    }

    // Deduct stock
    for (const item of cartItems) {
      const product: any = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - (item.quantity || 1));
        await product.save();
      }
    }

    // Clear cart
    await Cart.deleteMany({ user: userId });

    return res.status(200).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Internal server error placing order" });
  }
}
