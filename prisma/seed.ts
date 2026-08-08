import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const productSchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  brand: String,
  category: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  stock: Number,
  rating: Number,
  reviews: Number,
  image: String,
  featured: Boolean,
});
const MongoProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing');
  }

  console.log('Connecting to MongoDB to fetch products...');
  await mongoose.connect(MONGO_URI);
  
  const mongoProducts = await MongoProduct.find();
  console.log(`Found ${mongoProducts.length} products in MongoDB.`);

  console.log('Migrating products to PostgreSQL...');
  let count = 0;
  for (const p of mongoProducts) {
    // Upsert to avoid duplicates
    // Using title as unique identifier for seeding since Prisma schema doesn't have unique title
    // Wait, since we don't have a unique constraint on title in schema, we can search by title first
    const title = p.name || p.title || 'Untitled';
    const existing = await prisma.product.findFirst({
      where: { title }
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          title,
          description: p.description || '',
          brand: p.brand || '',
          category: p.category || '',
          price: p.price || 0,
          originalPrice: p.originalPrice || 0,
          discount: p.discount || 0,
          stock: p.stock || 0,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          image: p.image || '',
          featured: p.featured || false,
        }
      });
      count++;
    }
  }

  console.log(`Migration complete! Inserted ${count} new products into PostgreSQL.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    await prisma.$disconnect();
  });
