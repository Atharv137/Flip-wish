import { Request, Response } from "express";
import Product from "../../models/Product.js";

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

    const query: any = {};

    // 1. Live Search
    if (search) {
      const q = String(search);
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } }
      ];
    }

    // 2. Filters
    if (category) {
      query.category = { $in: String(category).split(",") };
    }

    if (brand) {
      query.brand = { $in: String(brand).split(",") };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // 3. Sorting
    let sortOptions: any = {};
    if (sortBy) {
      switch (sortBy) {
        case "priceLowToHigh":
          sortOptions = { price: 1 };
          break;
        case "priceHighToLow":
          sortOptions = { price: -1 };
          break;
        case "highestRated":
          sortOptions = { rating: -1 };
          break;
        case "popularity":
          sortOptions = { reviews: -1 };
          break;
        case "newest":
        default:
          sortOptions = { _id: -1 };
          break;
      }
    } else {
      sortOptions = { _id: -1 };
    }

    // 4. Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 8;
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    return res.status(200).json({
      products,
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
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Get product by id error:", error);
    return res.status(500).json({ error: "Internal server error fetching product" });
  }
}

// Admin Controller Functions
export async function createProduct(req: Request, res: Response): Promise<any> {
  try {
    const {
      title,
      name, // Adding name because user schema requested it as well
      description,
      brand,
      category,
      price,
      discount,
      originalPrice,
      image,
      stock
    } = req.body;

    const productTitle = title || name;

    if (!productTitle || !price) {
      return res.status(400).json({ error: "Name/title and price are required" });
    }

    if (!brand || !category || originalPrice === undefined || stock === undefined) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const calculatedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);

    const newProduct = new Product({
      name: productTitle,
      title: productTitle, // supporting both
      description: description || "No description provided.",
      brand,
      category,
      price: Number(price),
      discount: discount !== undefined ? Number(discount) : calculatedDiscount,
      originalPrice: Number(originalPrice),
      image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
      rating: 4.5, // Default rating
      reviews: 0,
      stock: Number(stock),
      deliveryDate: "Delivered in 3 Days"
    });

    await newProduct.save();

    return res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ error: "Internal server error creating product" });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Convert inputs if present
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.discount !== undefined) updates.discount = Number(updates.discount);

    // If price or original price changed, recalculate discount if not manually specified
    if ((updates.price !== undefined || updates.originalPrice !== undefined) && updates.discount === undefined) {
      const p = updates.price !== undefined ? updates.price : existing.price;
      const op = updates.originalPrice !== undefined ? updates.originalPrice : (existing as any).originalPrice;
      if (op && p) {
         updates.discount = Math.round(((op - p) / op) * 100);
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json({ message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ error: "Internal server error updating product" });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<any> {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ error: "Internal server error deleting product" });
  }
}
