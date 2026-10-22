import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { db } from "../config/db.js";

function calculateTotalQuantity(items: any[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function getCart(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;

    if (process.env.DATABASE_URL) {
      try {
        const cartItems = await prisma.cart.findMany({
          where: { userId },
          include: {
            product: true
          }
        });

        const totalQuantity = calculateTotalQuantity(cartItems);

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
          summary: { totalQuantity }
        });
      } catch (prismaErr) {
        console.warn("Prisma getCart error, using local fallback:", prismaErr);
      }
    }

    const localCart = db.carts.find(c => c.userId === userId);
    const mappedItems = localCart.map(item => {
      const prod = db.products.findOne(p => p.id === item.productId);
      return prod ? {
        ...item,
        _id: item.id,
        product: { ...prod, _id: prod.id }
      } : null;
    }).filter(Boolean);

    const totalQuantity = calculateTotalQuantity(mappedItems);

    return res.status(200).json({
      cartItems: mappedItems,
      summary: { totalQuantity }
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

    if (process.env.DATABASE_URL) {
      try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        if (product.stock <= 0) {
          return res.status(400).json({ error: "Out Of Stock" });
        }

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
      } catch (prismaErr) {
        console.warn("Prisma addToCart error, using local fallback:", prismaErr);
      }
    }

    const localProduct = db.products.findOne(p => p.id === productId);
    if (!localProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (localProduct.stock <= 0) {
      return res.status(400).json({ error: "Out Of Stock" });
    }

    const localExisting = db.carts.findOne(c => c.userId === userId && c.productId === productId);
    if (localExisting) {
      const newQuantity = localExisting.quantity + Number(quantity);
      if (newQuantity > localProduct.stock) {
        return res.status(400).json({
          error: `Cannot add more items. Only ${localProduct.stock} left in stock.`
        });
      }
      const updated = db.carts.update(localExisting.id, newQuantity);
      return res.status(200).json({
        message: "Cart updated",
        cartItem: { ...updated, _id: updated?.id }
      });
    }

    if (Number(quantity) > localProduct.stock) {
      return res.status(400).json({
        error: `Cannot add requested quantity. Only ${localProduct.stock} available.`
      });
    }

    const newItem = db.carts.insert({
      userId,
      productId,
      quantity: Number(quantity)
    });

    return res.status(201).json({
      message: "Added to cart",
      cartItem: { ...newItem, _id: newItem.id }
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

    if (process.env.DATABASE_URL) {
      try {
        const cartItem = await prisma.cart.findFirst({
          where: { id, userId },
          include: { product: true }
        });

        if (cartItem) {
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
        }
      } catch (prismaErr) {
        console.warn("Prisma updateCartItem error, using local fallback:", prismaErr);
      }
    }

    const localItem = db.carts.findOne(c => c.id === id && c.userId === userId);
    if (!localItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const localProd = db.products.findOne(p => p.id === localItem.productId);
    if (!localProd || localProd.stock <= 0) {
      return res.status(400).json({ error: "Product is out of stock." });
    }

    if (Number(quantity) > localProd.stock) {
      return res.status(400).json({
        error: `Only ${localProd.stock} items available in stock`
      });
    }

    const updated = db.carts.update(id, Number(quantity));
    return res.status(200).json({
      message: "Cart item updated",
      cartItem: { ...updated, _id: updated?.id }
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

    if (process.env.DATABASE_URL) {
      try {
        const cartItem = await prisma.cart.findFirst({ where: { id, userId } });
        if (cartItem) {
          await prisma.cart.delete({ where: { id } });
          return res.status(200).json({ message: "Item removed from cart", id });
        }
      } catch (prismaErr) {
        console.warn("Prisma deleteCartItem error, using local fallback:", prismaErr);
      }
    }

    db.carts.delete(id);
    return res.status(200).json({ message: "Item removed from cart", id });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return res.status(500).json({ error: "Internal server error deleting cart item" });
  }
}

export async function checkout(req: Request, res: Response): Promise<any> {
  try {
    const userId = (req as any).userId;

    if (process.env.DATABASE_URL) {
      try {
        const cartItems = await prisma.cart.findMany({
          where: { userId },
          include: { product: true }
        });

        if (cartItems.length > 0) {
          const failedItems: string[] = [];
          for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
              failedItems.push(item.product.title);
            }
          }

          if (failedItems.length > 0) {
            return res.status(400).json({
              error: `Stock changed during checkout. The following items have insufficient stock: ${failedItems.join(", ")}`
            });
          }

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
        }
      } catch (prismaErr) {
        console.warn("Prisma checkout error, using local fallback:", prismaErr);
      }
    }

    const localItems = db.carts.find(c => c.userId === userId);
    if (localItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const failed: string[] = [];
    for (const item of localItems) {
      const p = db.products.findOne(prod => prod.id === item.productId);
      if (!p || p.stock < item.quantity) {
        failed.push(p ? p.title : "Product");
      }
    }

    if (failed.length > 0) {
      return res.status(400).json({
        error: `Stock changed during checkout. The following items have insufficient stock: ${failed.join(", ")}`
      });
    }

    for (const item of localItems) {
      const p = db.products.findOne(prod => prod.id === item.productId);
      if (p) {
        db.products.update(p.id, { stock: Math.max(0, p.stock - item.quantity) });
      }
    }
    db.carts.clear(userId);

    return res.status(200).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Internal server error placing order" });
  }
}
