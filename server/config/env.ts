import "dotenv/config";

// Environment Variables Configuration
// This centralizes secrets management to ensure we don't hardcode sensitive info

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-wishlist",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "flipkart_secret_key_123!@#",
  geminiApiKey: process.env.GEMINI_API_KEY,
};
