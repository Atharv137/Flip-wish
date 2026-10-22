import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { db } from "../config/db.js";

export async function getWishlist(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;

    if (process.env.DATABASE_URL) {
      try {
        const wishlistItems = await prisma.wishlist.findMany({
          where: { userId },
          include: {
            product: true
          }
        });

        const mappedItems = wishlistItems.map(item => ({
          ...item,
          _id: item.id,
          product: {
            ...item.product,
            _id: item.product.id
          }
        }));

        return res.status(200).json(mappedItems);
      } catch (prismaErr) {
        console.warn("Prisma getWishlist error, using local fallback:", prismaErr);
      }
    }

    const localWishes = db.wishlists.find(w => w.userId === userId);
    const mapped = localWishes.map(w => {
      const prod = db.products.findOne(p => p.id === w.productId);
      return prod ? {
        ...w,
        _id: w.id,
        product: { ...prod, _id: prod.id }
      } : null;
    }).filter(Boolean);

    return res.status(200).json(mapped);
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

    if (process.env.DATABASE_URL) {
      try {
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
      } catch (prismaErr) {
        console.warn("Prisma addToWishlist error, writing to local fallback:", prismaErr);
      }
    }

    const localProd = db.products.findOne(p => p.id === productId);
    if (!localProd) {
      return res.status(404).json({ error: "Product not found" });
    }

    const localExisting = db.wishlists.findOne(w => w.userId === userId && w.productId === productId);
    if (localExisting) {
      return res.status(400).json({ error: "Product is already in wishlist" });
    }

    const wish = db.wishlists.insert({ userId, productId });
    return res.status(201).json({
      message: "Added to wishlist",
      wishlistItem: { ...wish, _id: wish.id }
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

    if (process.env.DATABASE_URL) {
      try {
        const wishlistItem = await prisma.wishlist.findFirst({
          where: { id, userId }
        });

        if (wishlistItem) {
          await prisma.wishlist.delete({ where: { id } });
          return res.status(200).json({ message: "Item removed from wishlist", id });
        }
      } catch (prismaErr) {
        console.warn("Prisma removeFromWishlist error, using local fallback:", prismaErr);
      }
    }

    db.wishlists.delete(id);
    db.wishlists.deleteByProduct(userId, id);

    return res.status(200).json({ message: "Item removed from wishlist", id });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({ error: "Internal server error removing from wishlist" });
  }
}

export async function checkWishlistStock(req: Request, res: Response): Promise<any> {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs array" });
    }

    if (process.env.DATABASE_URL) {
      try {
        const products = await prisma.product.findMany({
          where: {
            id: { in: productIds }
          },
          select: {
            id: true,
            stock: true,
            price: true,
            originalPrice: true
          }
        });

        const stockMap: Record<string, any> = {};
        products.forEach((product: any) => {
          stockMap[product.id] = {
            stock: product.stock,
            price: product.price,
            originalPrice: product.originalPrice
          };
        });

        return res.status(200).json({ stockMap });
      } catch (prismaErr) {
        console.warn("Prisma checkWishlistStock error, using local fallback:", prismaErr);
      }
    }

    const stockMap: Record<string, any> = {};
    for (const pid of productIds) {
      const p = db.products.findOne(prod => prod.id === pid);
      if (p) {
        stockMap[p.id] = {
          stock: p.stock,
          price: p.price,
          originalPrice: p.originalPrice
        };
      }
    }

    return res.status(200).json({ stockMap });
  } catch (error) {
    console.error("Check wishlist stock error:", error);
    return res.status(500).json({ error: "Internal server error checking wishlist stock" });
  }
}
