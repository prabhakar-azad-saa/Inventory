import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariantStock,
  deleteVariant,
  getStats,
} from "./routes/inventory";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Inventory API routes
  app.get("/api/products", getProducts);
  app.post("/api/products", createProduct);
  app.get("/api/products/:id", getProduct);
  app.put("/api/products/:id", updateProduct);
  app.delete("/api/products/:id", deleteProduct);

  // Variant routes
  app.post("/api/products/:id/variants", addVariant);
  app.put("/api/products/:id/variants/:variantId", updateVariantStock);
  app.delete("/api/products/:id/variants/:variantId", deleteVariant);

  // Stats route
  app.get("/api/stats", getStats);

  return app;
}
