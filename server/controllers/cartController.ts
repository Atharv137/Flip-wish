import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function getCart(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    
    // Fetch and populate product info using Prisma (Demonstrates SQL JOIN)
    // Prisma internally uses an SQL JOIN to fetch the related Product for each Cart item
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: true
      }
    });

    // Demonstrating JavaScript Hoisting: function declaration is used before definition
    const totalQuantity = calculateTotalQuantity(cartItems);

    // Map Prisma id to _id for frontend backward compatibility
    const mappedItems = cartItems.map(item => ({
      ...item,
      _id: item.id,
      product: {
        ...item.product,
        _id: item.product.id
      }
    }));

    return res.status(200).json({
      cartItems: mappedItems,
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

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ error: "Out Of Stock" });
    }

    // Check if item is already in cart
    const existing = await prisma.cart.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });
    
    if (existing) {
      const newQuantity = existing.quantity + Number(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({
          error: `Cannot add more items. Only ${product.stock} left in stock.`
        });
      }
      
      const updatedCartItem = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: newQuantity }
      });
      
      return res.status(200).json({
        message: "Cart updated",
        cartItem: { ...updatedCartItem, _id: updatedCartItem.id }
      });
    }

    if (Number(quantity) > product.stock) {
      return res.status(400).json({
        error: `Cannot add requested quantity. Only ${product.stock} available.`
      });
    }

    const newCartItem = await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity: Number(quantity)
      }
    });

    return res.status(201).json({
      message: "Added to cart",
      cartItem: { ...newCartItem, _id: newCartItem.id }
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

    // Verify cart item belongs to user
    const cartItem = await prisma.cart.findFirst({
      where: { id, userId },
      include: { product: true }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const product = cartItem.product;

    if (product.stock <= 0) {
      return res.status(400).json({ error: "Product is out of stock." });
    }

    if (Number(quantity) > product.stock) {
      return res.status(400).json({
        error: `Only ${product.stock} items available in stock`
      });
    }

    const updatedCartItem = await prisma.cart.update({
      where: { id },
      data: { quantity: Number(quantity) }
    });

    return res.status(200).json({
      message: "Cart item updated",
      cartItem: { ...updatedCartItem, _id: updatedCartItem.id }
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

    // Check if it exists and belongs to user
    const cartItem = await prisma.cart.findFirst({ where: { id, userId } });
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    
    await prisma.cart.delete({ where: { id } });

    return res.status(200).json({ message: "Item removed from cart", id });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return res.status(500).json({ error: "Internal server error deleting cart item" });
  }
}

export async function checkout(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const failedItems: string[] = [];
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        failedItems.push(item.product.title);
      }
    }

    if (failedItems.length > 0) {
      return res.status(400).json({
        error: `Stock changed during checkout. The following items are out of stock or have insufficient stock: ${failedItems.join(", ")}`
      });
    }

    // Deduct stock and clear cart (Prisma Transaction is perfect here for database consistency, but we'll use a sequential loop for simplicity unless a transaction is strictly preferred)
    // We can showcase a Prisma transaction to be even better!
    await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: Math.max(0, item.product.stock - item.quantity) }
        });
      }
      await tx.cart.deleteMany({ where: { userId } });
    });

    return res.status(200).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Internal server error placing order" });
  }
}

// Demonstrating JavaScript Hoisting: 
// This function declaration is hoisted, allowing it to be called earlier in the file (e.g., in getCart)
function calculateTotalQuantity(items: any[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
