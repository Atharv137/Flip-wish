import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export async function getProducts(req: Request, res: Response): Promise<any> {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sortBy,
      page = "1",
      limit = "8"
    } = req.query;

    const where: any = {};

    // 1. Live Search
    if (search) {
      const q = String(search);
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
    }

    // 2. Filters
    if (category && category !== "All") {
      where.category = { in: String(category).split(",") };
    }

    if (brand) {
      where.brand = { in: String(brand).split(",") };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (rating) {
      where.rating = { gte: Number(rating) };
    }

    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    // 3. Sorting
    let orderBy: any = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceLowToHigh":
          orderBy = { price: 'asc' };
          break;
        case "priceHighToLow":
          orderBy = { price: 'desc' };
          break;
        case "highestRated":
          orderBy = { rating: 'desc' };
          break;
        case "popularity":
          orderBy = { reviews: 'desc' };
          break;
        case "newest":
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // 4. Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 8;
    const skip = (pageNum - 1) * limitNum;

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limitNum
    });

    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limitNum);

    const mappedProducts = products.map(p => ({ ...p, _id: p.id }));

    return res.status(200).json({
      products: mappedProducts,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
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

    return res.status(200).json({ ...product, _id: product.id });
  } catch (error) {
    console.error("Get product by ID error:", error);
    return res.status(500).json({ error: "Internal server error fetching product" });
  }
}

export async function createProduct(req: Request, res: Response): Promise<any> {
  try {
    const { title, description, brand, category, price, originalPrice, discount, stock, rating, reviews, image, featured } = req.body;
    
    const newProduct = await prisma.product.create({
      data: {
        title,
        description: description || "",
        brand: brand || "",
        category: category || "",
        price: Number(price) || 0,
        originalPrice: Number(originalPrice) || 0,
        discount: Number(discount) || 0,
        stock: Number(stock) || 0,
        rating: Number(rating) || 0,
        reviews: Number(reviews) || 0,
        image: image || "",
        featured: Boolean(featured)
      }
    });
    
    return res.status(201).json({ message: "Product created", product: { ...newProduct, _id: newProduct.id } });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ error: "Internal server error creating product" });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    return res.status(200).json({ message: "Product updated", product: { ...updatedProduct, _id: updatedProduct.id } });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ error: "Internal server error updating product" });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ error: "Internal server error deleting product" });
  }
}
