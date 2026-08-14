import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  mongoUri: process.env.MONGO_URI!,
  databaseUrl: process.env.DATABASE_URL!,

  jwtSecret: process.env.JWT_SECRET!,
  geminiApiKey: process.env.GEMINI_API_KEY,
};