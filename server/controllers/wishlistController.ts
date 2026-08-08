import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function getWishlist(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    
    // Fetch and populate product info using Prisma (SQL JOIN equivalent)
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true
      }
    });

    // Map Prisma id to _id for frontend backward compatibility
    const mappedItems = wishlistItems.map(item => ({
      ...item,
      _id: item.id,
      product: {
        ...item.product,
        _id: item.product.id
      }
    }));

    return res.status(200).json({ wishlistItems: mappedItems });
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

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Product is already in wishlist" });
    }

    const newWishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId
      }
    });

    return res.status(201).json({
      message: "Added to wishlist",
      wishlistItem: { ...newWishlistItem, _id: newWishlistItem.id }
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({ error: "Internal server error adding to wishlist" });
  }
}

export async function removeFromWishlist(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const wishlistItem = await prisma.wishlist.findFirst({
      where: { id, userId }
    });

    if (!wishlistItem) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    await prisma.wishlist.delete({ where: { id } });

    return res.status(200).json({ message: "Item removed from wishlist", id });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({ error: "Internal server error removing from wishlist" });
  }
}
