/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Variant type for products
 */
export interface Variant {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
  barcode: string;
}

/**
 * Product type for inventory
 */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  variants: Variant[];
  createdAt: string;
}
