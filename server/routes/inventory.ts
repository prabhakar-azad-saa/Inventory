import { RequestHandler } from "express";
import { Product, Variant } from "@shared/api";

// In-memory storage (replace with database in production)
let products: Product[] = [];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateSKU(brand: string, product: string, color: string, size: string): string {
  const format = (s: string) => s.substring(0, 3).toUpperCase();
  return `${format(brand)}-${format(product)}-${format(color)}-${size}`;
}

function generateBarcode(): string {
  return Math.random().toString().substring(2, 14);
}

// Get all products
export const getProducts: RequestHandler = (_req, res) => {
  res.json(products);
};

// Create a new product
export const createProduct: RequestHandler = (req, res) => {
  const { name, brand, category } = req.body;

  if (!name || !brand || !category) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const product: Product = {
    id: generateId(),
    name,
    brand,
    category,
    variants: [],
    createdAt: new Date().toISOString(),
  };

  products.push(product);
  res.status(201).json(product);
};

// Get a specific product
export const getProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
};

// Update a product
export const updateProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, brand, category } = req.body;

  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  if (name) product.name = name;
  if (brand) product.brand = brand;
  if (category) product.category = category;

  res.json(product);
};

// Delete a product
export const deleteProduct: RequestHandler = (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  products.splice(index, 1);
  res.status(204).send();
};

// Add a variant to a product
export const addVariant: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { size, color, price, stock } = req.body;

  if (!size || !color || price === undefined || stock === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const sku = generateSKU(product.brand, product.name, color, size);
  const barcode = generateBarcode();

  const variant: Variant = {
    id: generateId(),
    size,
    color,
    price,
    stock,
    sku,
    barcode,
  };

  product.variants.push(variant);
  res.status(201).json(variant);
};

// Update variant stock
export const updateVariantStock: RequestHandler = (req, res) => {
  const { id, variantId } = req.params;
  const { stock } = req.body;

  if (stock === undefined) {
    res.status(400).json({ error: "Stock quantity is required" });
    return;
  }

  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  variant.stock = stock;
  res.json(variant);
};

// Delete a variant
export const deleteVariant: RequestHandler = (req, res) => {
  const { id, variantId } = req.params;

  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const variantIndex = product.variants.findIndex((v) => v.id === variantId);
  if (variantIndex === -1) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  product.variants.splice(variantIndex, 1);
  res.status(204).send();
};

// Get inventory statistics
export const getStats: RequestHandler = (_req, res) => {
  let totalVariants = 0;
  let totalStock = 0;

  products.forEach((product) => {
    totalVariants += product.variants.length;
    product.variants.forEach((variant) => {
      totalStock += variant.stock;
    });
  });

  res.json({
    totalProducts: products.length,
    totalVariants,
    totalStock,
  });
};
