import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./server/routes/api";
import "dotenv/config";
import connectDB from "./config/db.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON and URL encoded payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API router
  app.use("/api", apiRouter);

  // Vite middleware integration for Dev, Static serving for Production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the Express server:", error);
});
