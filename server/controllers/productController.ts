import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { db } from "../config/db.js";

function getLocalProducts(query: any) {
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
  } = query;

  let all = [...db.products.find()];

  // 1. Search
  if (search) {
    const q = String(search).toLowerCase();
    all = all.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // 2. Filters
  if (category && category !== "All") {
    const categories = String(category).split(",").map(c => c.trim().toLowerCase());
    all = all.filter(p => categories.includes(p.category.toLowerCase()));
  }

  if (brand) {
    const brands = String(brand).split(",").map(b => b.trim().toLowerCase());
    all = all.filter(p => brands.includes(p.brand.toLowerCase()));
  }

  if (minPrice || maxPrice) {
    if (minPrice) all = all.filter(p => p.price >= Number(minPrice));
    if (maxPrice) all = all.filter(p => p.price <= Number(maxPrice));
  }

  if (rating) {
    all = all.filter(p => p.rating >= Number(rating));
  }

  if (inStock === "true") {
    all = all.filter(p => p.stock > 0);
  }

  // 3. Sorting
  if (sortBy) {
    switch (sortBy) {
      case "priceLowToHigh":
        all.sort((a, b) => a.price - b.price);
        break;
      case "priceHighToLow":
        all.sort((a, b) => b.price - a.price);
        break;
      case "highestRated":
        all.sort((a, b) => b.rating - a.rating);
        break;
      case "popularity":
        all.sort((a, b) => b.reviews - a.reviews);
        break;
      case "newest":
      default:
        break;
    }
  }

  // 4. Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 8;
  const skip = (pageNum - 1) * limitNum;
  const paginated = all.slice(skip, skip + limitNum);
  const totalProducts = all.length;
  const totalPages = Math.ceil(totalProducts / limitNum);

  const mappedProducts = paginated.map(p => ({ ...p, _id: p.id }));

  return {
    products: mappedProducts,
    pagination: {
      totalProducts,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    }
  };
}

export async function getProducts(req: Request, res: Response): Promise<any> {
  if (process.env.DATABASE_URL) {
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

      if (search) {
        const q = String(search);
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ];
      }

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
      console.warn("Prisma getProducts error, falling back to local database:", error);
    }
  }

  // Fallback to local database
  const result = getLocalProducts(req.query);
  return res.status(200).json(result);
}

export async function getProductById(req: Request, res: Response): Promise<any> {
  const { id } = req.params;

  if (process.env.DATABASE_URL) {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (product) {
        return res.status(200).json({ ...product, _id: product.id });
      }
    } catch (error) {
      console.warn("Prisma getProductById error, falling back to local database:", error);
    }
  }

  const localProduct = db.products.findOne(p => p.id === id);
  if (!localProduct) {
    return res.status(404).json({ error: "Product not found" });
  }

  return res.status(200).json({ ...localProduct, _id: localProduct.id });
}

export async function createProduct(req: Request, res: Response): Promise<any> {
  try {
    const { title, description, brand, category, price, originalPrice, discount, stock, rating, reviews, image, featured } = req.body;

    if (process.env.DATABASE_URL) {
      try {
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
      } catch (prismaErr) {
        console.warn("Prisma createProduct error, writing to local database:", prismaErr);
      }
    }

    const localCreated = db.products.insert({
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
      deliveryDate: "In 2-3 days"
    });

    return res.status(201).json({ message: "Product created", product: { ...localCreated, _id: localCreated.id } });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ error: "Internal server error creating product" });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (process.env.DATABASE_URL) {
      try {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (existing) {
          const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
          });
          return res.status(200).json({ message: "Product updated", product: { ...updatedProduct, _id: updatedProduct.id } });
        }
      } catch (prismaErr) {
        console.warn("Prisma updateProduct error, falling back to local database:", prismaErr);
      }
    }

    const localUpdated = db.products.update(id, updateData);
    if (!localUpdated) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated", product: { ...localUpdated, _id: localUpdated.id } });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ error: "Internal server error updating product" });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;

    if (process.env.DATABASE_URL) {
      try {
        const existing = await prisma.product.findUnique({ where: { id } });
        if (existing) {
          await prisma.product.delete({ where: { id } });
          return res.status(200).json({ message: "Product deleted" });
        }
      } catch (prismaErr) {
        console.warn("Prisma deleteProduct error, falling back to local database:", prismaErr);
      }
    }

    const localDeleted = db.products.delete(id);
    if (!localDeleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ error: "Internal server error deleting product" });
  }
}
