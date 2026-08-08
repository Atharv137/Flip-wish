import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function getProducts(req: Request, res: Response): Promise<any> {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort, 
      featured 
    } = req.query;

    const where: any = {};

    if (category && category !== "All") {
      where.category = category as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

    if (featured === "true") {
      where.featured = true;
    }

    let orderBy: any = {};
    if (sort === "price-low") {
      orderBy = { price: 'asc' };
    } else if (sort === "price-high") {
      orderBy = { price: 'desc' };
    } else if (sort === "rating") {
      orderBy = { rating: 'desc' };
    } else if (sort === "newest") {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy
    });

    const mappedProducts = products.map(p => ({ ...p, _id: p.id }));

    return res.status(200).json({ products: mappedProducts });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ error: "Internal server error fetching products" });
  }
}

export async function getProductById(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ product: { ...product, _id: product.id } });
  } catch (error) {
    console.error("Get product by ID error:", error);
    return res.status(500).json({ error: "Internal server error fetching product" });
  }
}
