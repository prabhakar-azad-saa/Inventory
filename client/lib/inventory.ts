export interface Variant {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
  barcode: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  variants: Variant[];
  createdAt: string;
}

const STORAGE_KEY = "inventory_data";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateSKU(brand: string, product: string, color: string, size: string): string {
  const format = (s: string) => s.substring(0, 3).toUpperCase();
  return `${format(brand)}-${format(product)}-${format(color)}-${size}`;
}

function generateBarcode(): string {
  // Simple barcode generator - creates a Code128 compatible string
  return Math.random().toString().substring(2, 14);
}

export function getProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function createProduct(name: string, brand: string, category: string): Product {
  const product: Product = {
    id: generateId(),
    name,
    brand,
    category,
    variants: [],
    createdAt: new Date().toISOString(),
  };

  const products = getProducts();
  products.push(product);
  saveProducts(products);

  return product;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) return null;

  products[index] = { ...products[index], ...updates };
  saveProducts(products);

  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);

  if (filtered.length === products.length) return false;

  saveProducts(filtered);
  return true;
}

export function addVariant(
  productId: string,
  size: string,
  color: string,
  price: number,
  stock: number
): Variant | null {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) return null;

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
  saveProducts(products);

  return variant;
}

export function updateVariant(
  productId: string,
  variantId: string,
  updates: Partial<Variant>
): Variant | null {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) return null;

  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return null;

  Object.assign(variant, updates);
  saveProducts(products);

  return variant;
}

export function deleteVariant(productId: string, variantId: string): boolean {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) return false;

  const filtered = product.variants.filter((v) => v.id !== variantId);

  if (filtered.length === product.variants.length) return false;

  product.variants = filtered;
  saveProducts(products);

  return true;
}

export function getTotalStats() {
  const products = getProducts();
  let totalVariants = 0;
  let totalStock = 0;

  products.forEach((product) => {
    totalVariants += product.variants.length;
    product.variants.forEach((variant) => {
      totalStock += variant.stock;
    });
  });

  return {
    totalProducts: products.length,
    totalVariants,
    totalStock,
  };
}
