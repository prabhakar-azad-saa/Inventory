import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getProducts, createProduct, addVariant, deleteProduct, deleteVariant, Product, Variant } from "@/lib/inventory";
import { Plus, X, Download, QrCode } from "lucide-react";
import JsBarcode from "jsbarcode";
import { useRef } from "react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newVariantProductId, setNewVariantProductId] = useState<string | null>(null);
  
  // Form states
  const [productName, setProductName] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productCategory, setProductCategory] = useState("");
  
  const [variantSize, setVariantSize] = useState("");
  const [variantColor, setVariantColor] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantStock, setVariantStock] = useState("");

  const barcodeRefs = useRef<{ [key: string]: SVGSVGElement | null }>({});

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    // Render barcodes
    Object.entries(barcodeRefs.current).forEach(([barcode, ref]) => {
      if (ref) {
        try {
          JsBarcode(ref, barcode, {
            format: "CODE128",
            width: 2,
            height: 50,
            margin: 5,
          });
        } catch (e) {
          // Ignore invalid barcodes
        }
      }
    });
  }, [products]);

  const refreshProducts = () => {
    setProducts(getProducts());
  };

  const handleCreateProduct = () => {
    if (!productName || !productBrand || !productCategory) return;

    createProduct(productName, productBrand, productCategory);
    setProductName("");
    setProductBrand("");
    setProductCategory("");
    setNewProductOpen(false);
    refreshProducts();
    window.dispatchEvent(new Event("inventoryUpdated"));
  };

  const handleAddVariant = (productId: string) => {
    if (!variantSize || !variantColor || !variantPrice || !variantStock) return;

    addVariant(productId, variantSize, variantColor, parseFloat(variantPrice), parseInt(variantStock));
    setVariantSize("");
    setVariantColor("");
    setVariantPrice("");
    setVariantStock("");
    setNewVariantProductId(null);
    refreshProducts();
    window.dispatchEvent(new Event("inventoryUpdated"));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product and all its variants?")) {
      deleteProduct(id);
      refreshProducts();
      window.dispatchEvent(new Event("inventoryUpdated"));
    }
  };

  const handleDeleteVariant = (productId: string, variantId: string) => {
    if (window.confirm("Are you sure you want to delete this variant?")) {
      deleteVariant(productId, variantId);
      refreshProducts();
      window.dispatchEvent(new Event("inventoryUpdated"));
    }
  };

  const handleGeneratePriceTag = (product: Product, variant: Variant) => {
    // Generate printable price tag as PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Price Tag</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .tag { width: 400px; border: 1px solid #000; padding: 20px; text-align: center; }
          .brand { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .product { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .details { font-size: 14px; margin-bottom: 15px; }
          .barcode { margin: 20px 0; }
          .price { font-size: 36px; font-weight: bold; color: #e74c3c; margin: 20px 0; }
          .sku { font-size: 12px; margin-top: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="tag">
          <div class="brand">${product.brand}</div>
          <div class="product">${product.name}</div>
          <div class="details">
            Size: ${variant.size} | Color: ${variant.color}
          </div>
          <div class="barcode">
            <svg id="barcode"></svg>
          </div>
          <div class="price">₹${variant.price.toFixed(2)}</div>
          <div class="sku">SKU: ${variant.sku}</div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          JsBarcode("#barcode", "${variant.barcode}", { format: "CODE128", width: 2, height: 50 });
          window.print();
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const categories = ["T-Shirts", "Jeans", "Shirts", "Dresses", "Jackets", "Accessories"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Navy", "Gray"];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Products</h2>
            <p className="text-muted-foreground mt-1">Manage your inventory and create variants</p>
          </div>
          <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="w-4 h-4" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Product Name</label>
                  <Input
                    placeholder="e.g., Denim Jeans"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Brand</label>
                  <Input
                    placeholder="e.g., Azure"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                  <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateProduct}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={!productName || !productBrand || !productCategory}
                >
                  Create Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card className="p-12 text-center border border-border">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No products yet. Create your first product to get started.</p>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="border border-border overflow-hidden">
                {/* Product Header */}
                <div className="bg-secondary/50 p-6 border-b border-border flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Brand: <strong className="text-foreground">{product.brand}</strong></span>
                      <span>Category: <strong className="text-foreground">{product.category}</strong></span>
                      <span>Variants: <strong className="text-foreground">{product.variants.length}</strong></span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Variants */}
                <div className="p-6">
                  {product.variants.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No variants yet</p>
                      <Dialog open={newVariantProductId === product.id} onOpenChange={(open) => {
                        if (!open) setNewVariantProductId(null);
                        else setNewVariantProductId(product.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-3 h-3 mr-2" />
                            Add Variant
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Variant - {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Size</label>
                              <Select value={variantSize} onValueChange={setVariantSize}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizes.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Color</label>
                              <Select value={variantColor} onValueChange={setVariantColor}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map((color) => (
                                    <SelectItem key={color} value={color}>
                                      {color}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Price</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={variantPrice}
                                onChange={(e) => setVariantPrice(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Stock Quantity</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variantStock}
                                onChange={(e) => setVariantStock(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => handleAddVariant(product.id)}
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                              disabled={!variantSize || !variantColor || !variantPrice || !variantStock}
                            >
                              Create Variant
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 font-semibold text-foreground">Size</th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">Color</th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">SKU</th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">Price</th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">Stock</th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">Barcode</th>
                              <th className="text-right py-2 px-3 font-semibold text-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((variant) => (
                              <tr key={variant.id} className="border-b border-border hover:bg-secondary/30">
                                <td className="py-3 px-3 font-medium text-foreground">{variant.size}</td>
                                <td className="py-3 px-3 text-muted-foreground">{variant.color}</td>
                                <td className="py-3 px-3 font-mono text-sm text-foreground">{variant.sku}</td>
                                <td className="py-3 px-3 font-medium text-foreground">₹{variant.price.toFixed(2)}</td>
                                <td className="py-3 px-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {variant.stock}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="w-12 h-8 flex items-center">
                                    <svg
                                      ref={(ref) => {
                                        if (ref) barcodeRefs.current[variant.barcode] = ref;
                                      }}
                                      className="w-full h-full"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleGeneratePriceTag(product, variant)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteVariant(product.id, variant.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Variant Button */}
                      <Dialog open={newVariantProductId === product.id} onOpenChange={(open) => {
                        if (!open) setNewVariantProductId(null);
                        else setNewVariantProductId(product.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full">
                            <Plus className="w-3 h-3 mr-2" />
                            Add Variant
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Variant - {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Size</label>
                              <Select value={variantSize} onValueChange={setVariantSize}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sizes.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Color</label>
                              <Select value={variantColor} onValueChange={setVariantColor}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colors.map((color) => (
                                    <SelectItem key={color} value={color}>
                                      {color}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Price</label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={variantPrice}
                                onChange={(e) => setVariantPrice(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">Stock Quantity</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variantStock}
                                onChange={(e) => setVariantStock(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => handleAddVariant(product.id)}
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                              disabled={!variantSize || !variantColor || !variantPrice || !variantStock}
                            >
                              Create Variant
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
