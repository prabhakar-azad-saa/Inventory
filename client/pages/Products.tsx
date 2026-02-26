import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getProducts,
  createProduct,
  addVariant,
  deleteProduct,
  deleteVariant,
  Product,
  Variant,
} from "@/lib/inventory";
import { Plus, X, Download, QrCode, Printer, Trash2 } from "lucide-react";
import JsBarcode from "jsbarcode";

interface SelectedItem {
  productId: string;
  variantId: string;
  productName: string;
  brand: string;
  size: string;
  color: string;
  price: number;
  barcode: string;
  sku: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newVariantProductId, setNewVariantProductId] = useState<string | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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

  const toggleSelectItem = (productId: string, variantId: string) => {
    const key = `${productId}-${variantId}`;
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAllProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newSelected = new Set(selectedItems);
    const allSelected = product.variants.every((v) =>
      newSelected.has(`${productId}-${v.id}`),
    );

    product.variants.forEach((variant) => {
      const key = `${productId}-${variant.id}`;
      if (allSelected) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
    });

    setSelectedItems(newSelected);
  };

  const getSelectedItemsData = (): SelectedItem[] => {
    const items: SelectedItem[] = [];
    selectedItems.forEach((key) => {
      const [productId, variantId] = key.split("-");
      const product = products.find((p) => p.id === productId);
      if (product) {
        const variant = product.variants.find((v) => v.id === variantId);
        if (variant) {
          items.push({
            productId,
            variantId,
            productName: product.name,
            brand: product.brand,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            barcode: variant.barcode,
            sku: variant.sku,
          });
        }
      }
    });
    return items;
  };

  // const handlePrintSelected = () => {
  //   const items = getSelectedItemsData();
  //   if (items.length === 0) return;

  //   const printWindow = window.open("", "_blank");
  //   if (!printWindow) return;

  //   let html = `
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>Print Price Tags</title>
  //       <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  //       <style>
  //         * { margin: 0; padding: 0; box-sizing: border-box; }
  //         body {
  //           margin: 0;
  //           padding: 5px;
  //           font-family: 'Inter', 'Segoe UI', sans-serif;
  //           background: white;
  //         }
  //         .tags-grid {
  //           display: grid;
  //           grid-template-columns: repeat(2, 1fr);
  //           gap: 8px;
  //         }
  //         .tag {
  //           width: 2in;
  //           height: 3in;
  //           border: 1px solid #2c3e50;
  //           padding: 10px;
  //           text-align: center;
  //           page-break-inside: avoid;
  //           background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  //           display: flex;
  //           flex-direction: column;
  //           justify-content: space-between;
  //           box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  //         }
  //         .header {
  //           border-bottom: 2px solid #1a472a;
  //           padding-bottom: 5px;
  //           margin-bottom: 5px;
  //         }
  //         .company-name {
  //           font-size: 9px;
  //           font-weight: 800;
  //           color: #1a472a;
  //           letter-spacing: 0.8px;
  //           font-family: 'Poppins', sans-serif;
  //         }
  //         .brand {
  //           font-size: 12px;
  //           font-weight: 700;
  //           margin-top: 2px;
  //           color: #1a472a;
  //           font-family: 'Poppins', sans-serif;
  //           letter-spacing: 0.2px;
  //         }
  //         .product {
  //           font-size: 10px;
  //           font-weight: 600;
  //           margin-bottom: 2px;
  //           color: #2c3e50;
  //           line-height: 1.2;
  //         }
  //         .size-color {
  //           background: linear-gradient(135deg, #1a472a 0%, #2a5a3a 100%);
  //           color: white;
  //           padding: 3px 5px;
  //           border-radius: 2px;
  //           font-size: 7px;
  //           font-weight: 700;
  //           margin-bottom: 5px;
  //           letter-spacing: 0.2px;
  //         }
  //         .price-section {
  //           background: linear-gradient(135deg, #1a472a 0%, #2a5a3a 100%);
  //           border-radius: 3px;
  //           padding: 6px 0;
  //           margin: 5px 0;
  //         }
  //         .price {
  //           font-size: 28px;
  //           font-weight: 800;
  //           color: #fff;
  //           line-height: 1;
  //           font-family: 'Poppins', sans-serif;
  //           letter-spacing: -0.3px;
  //         }
  //         .mrp-label {
  //           font-size: 5.5px;
  //           color: rgba(255,255,255,0.9);
  //           margin-top: 1px;
  //           font-weight: 600;
  //           letter-spacing: 0.3px;
  //         }
  //         .barcode {
  //           margin: 4px 0;
  //           text-align: center;
  //         }
  //         .barcode svg {
  //           max-width: 100%;
  //           height: 30px;
  //         }
  //         .sku {
  //           font-size: 6px;
  //           color: #5a5a5a;
  //           margin-bottom: 2px;
  //           font-family: 'Courier New', monospace;
  //           font-weight: 700;
  //           letter-spacing: 0.1px;
  //         }
  //         .footer {
  //           border-top: 1px solid #d0d0d0;
  //           padding-top: 2px;
  //           font-size: 4.5px;
  //           color: #666;
  //           line-height: 1.2;
  //           font-weight: 500;
  //         }
  //         .email {
  //           color: #1a472a;
  //           font-weight: 700;
  //           margin-bottom: 1px;
  //         }

  //         @media print {
  //           * { margin: 0 !important; padding: 0 !important; }
  //           body {
  //             margin: 0 !important;
  //             padding: 2px !important;
  //             background: white !important;
  //           }
  //           .tags-grid {
  //             display: grid;
  //             grid-template-columns: repeat(2, 1fr);
  //             gap: 6px !important;
  //             margin: 0 !important;
  //             padding: 0 !important;
  //           }
  //           .tag {
  //             margin: 0 !important;
  //             page-break-inside: avoid !important;
  //             width: 2in !important;
  //             height: 3in !important;
  //             border: 1px solid #2c3e50 !important;
  //             padding: 9px !important;
  //             box-shadow: none !important;
  //           }
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="tags-grid">
  //   `;

  //   items.forEach((item, index) => {
  //     html += `
  //       <div class="tag">
  //         <div class="header">
  //           <div class="company-name">VILOOM</div>
  //           <div class="brand">${item.brand}</div>
  //         </div>

  //         <div class="product">${item.productName}</div>

  //         <div class="size-color">
  //           Size: ${item.size} | ${item.color}
  //         </div>

  //         <div class="price-section">
  //           <div class="price">₹${item.price.toFixed(2)}</div>
  //           <div class="mrp-label">MRP (Inclusive of Tax)</div>
  //         </div>

  //         <div class="barcode">
  //           <svg id="barcode-${index}"></svg>
  //         </div>

  //         <div class="sku">${item.sku}</div>

  //         <div class="footer">
  //           <div class="email">Support@Viloom.in</div>
  //           <div>Puzzle Theory Pvt Ltd</div>
  //           <div>Mandsaur, MP 458001</div>
  //         </div>
  //       </div>
  //     `;
  //   });

  //   html += `
  //       </div>
  //       <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
  //       <script>
  //         const items = ${JSON.stringify(items)};
  //         items.forEach((item, index) => {
  //           const svg = document.getElementById('barcode-' + index);
  //           if (svg) {
  //             JsBarcode(svg, item.barcode, {
  //               format: "CODE128",
  //               width: 1.5,
  //               height: 30,
  //               margin: 2
  //             });
  //           }
  //         });
  //         setTimeout(() => window.print(), 400);
  //       <\/script>
  //     </body>
  //     </html>
  //   `;

  //   printWindow.document.write(html);
  //   printWindow.document.close();
  // };
  const handlePrintSelected = () => {
    const items = getSelectedItemsData();
    if (items.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let html = `
<!DOCTYPE html>
<html>
<head>
<title>VILOOM Labels</title>

<style>
@page {
  size: 2in 3in;
  margin: 0;
}

html, body {
  margin: 0;
  padding: 0;
}

.page {
  width: 2in;
  height: 3in;
  box-sizing: border-box;
  border: 2px solid #000;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
  font-family: Arial, Helvetica, sans-serif;
}

.logo {
  text-align: center;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 4px;
}

.brand {
  text-align: center;
  font-size: 9px;
  margin-top: 4px;
}

.product-name {
  margin-top: 8px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
}

.meta {
  margin-top: 5px;
  font-size: 9px;
  line-height: 1.4;
  text-align: center;
}

.price {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  margin: 8px 0;
}

.tax {
  text-align: center;
  font-size: 7px;
}

.barcode {
  text-align: center;
  margin-top: 6px;
}

.barcode svg {
  width: 100%;
  height: 48px;
}

.sku {
  text-align: center;
  font-size: 8px;
  margin-top: 4px;
}

.footer {
  border-top: 1px solid #000;
  padding-top: 6px;
  font-size: 7px;
  text-align: center;
  line-height: 1.3;
}
</style>

</head>
<body>
`;

    items.forEach((item, index) => {
      html += `
    <div class="page">

      <div>
        <div class="logo">VILOOM</div>
        <div class="brand">${item.brand}</div>

        <div class="product-name">${item.productName}</div>

        <div class="meta">
          Category: ${products.find((p) => p.id === item.productId)?.category || ""}
          <br/>
          Size: ${item.size} | Color: ${item.color}
        </div>
      </div>

      <div>
        <div class="price">₹${item.price.toFixed(2)}</div>
        <div class="tax">MRP (Inclusive of all taxes)</div>

        <div class="barcode">
          <svg id="barcode-${index}"></svg>
        </div>

        <div class="sku">SKU: ${item.sku}</div>
      </div>

      <div class="footer">
        Puzzle Theory Pvt Ltd<br/>
        Mandsaur, MP - 458001<br/>
        Support@Viloom.in
      </div>

    </div>
    `;
    });

    html += `
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>

<script>
const items = ${JSON.stringify(items)};

items.forEach((item, index) => {
  JsBarcode("#barcode-" + index, item.barcode, {
    format: "CODE128",
    width: 3,
    height: 48,
    displayValue: false,
    margin: 0
  });
});

setTimeout(() => window.print(), 400);
<\/script>

</body>
</html>
`;

    printWindow.document.write(html);
    printWindow.document.close();
  };
  const handleDeleteSelected = () => {
    if (!window.confirm(`Delete ${selectedItems.size} selected items?`)) return;

    selectedItems.forEach((key) => {
      const [productId, variantId] = key.split("-");
      deleteVariant(productId, variantId);
    });

    setSelectedItems(new Set());
    refreshProducts();
    window.dispatchEvent(new Event("inventoryUpdated"));
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

    addVariant(
      productId,
      variantSize,
      variantColor,
      parseFloat(variantPrice),
      parseInt(variantStock),
    );
    setVariantSize("");
    setVariantColor("");
    setVariantPrice("");
    setVariantStock("");
    setNewVariantProductId(null);
    refreshProducts();
    window.dispatchEvent(new Event("inventoryUpdated"));
  };

  const handleDeleteProduct = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product and all its variants?",
      )
    ) {
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
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // const html = `
    //   <!DOCTYPE html>
    //   <html>
    //   <head>
    //     <title>Price Tag</title>
    //     <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    //     <style>
    //       * { margin: 0; padding: 0; box-sizing: border-box; }
    //       body {
    //         margin: 0;
    //         padding: 6px;
    //         font-family: 'Inter', 'Segoe UI', sans-serif;
    //         background: white;
    //       }
    //       .tag {
    //         width: 2in;
    //         height: 3in;
    //         border: 1px solid #2c3e50;
    //         padding: 11px;
    //         text-align: center;
    //         page-break-inside: avoid;
    //         margin: 0 auto;
    //         background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
    //         display: flex;
    //         flex-direction: column;
    //         justify-content: space-between;
    //         box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    //       }
    //       .header {
    //         border-bottom: 2px solid #1a472a;
    //         padding-bottom: 6px;
    //         margin-bottom: 6px;
    //       }
    //       .company-name {
    //         font-size: 10px;
    //         font-weight: 800;
    //         color: #1a472a;
    //         letter-spacing: 1px;
    //         font-family: 'Poppins', sans-serif;
    //       }
    //       .brand {
    //         font-size: 13px;
    //         font-weight: 700;
    //         margin-top: 3px;
    //         color: #1a472a;
    //         font-family: 'Poppins', sans-serif;
    //         letter-spacing: 0.3px;
    //       }
    //       .product {
    //         font-size: 11px;
    //         font-weight: 600;
    //         margin-bottom: 3px;
    //         color: #2c3e50;
    //         line-height: 1.3;
    //         letter-spacing: 0.2px;
    //       }
    //       .size-color {
    //         background: linear-gradient(135deg, #1a472a 0%, #2a5a3a 100%);
    //         color: white;
    //         padding: 4px 6px;
    //         border-radius: 2px;
    //         font-size: 7.5px;
    //         font-weight: 700;
    //         margin-bottom: 6px;
    //         letter-spacing: 0.3px;
    //       }
    //       .price-section {
    //         background: linear-gradient(135deg, #1a472a 0%, #2a5a3a 100%);
    //         border-radius: 3px;
    //         padding: 7px 0;
    //         margin: 6px 0;
    //       }
    //       .price {
    //         font-size: 30px;
    //         font-weight: 800;
    //         color: #fff;
    //         line-height: 1;
    //         font-family: 'Poppins', sans-serif;
    //         letter-spacing: -0.5px;
    //       }
    //       .mrp-label {
    //         font-size: 6px;
    //         color: rgba(255,255,255,0.9);
    //         margin-top: 2px;
    //         font-weight: 600;
    //         letter-spacing: 0.5px;
    //       }
    //       .barcode {
    //         margin: 5px 0;
    //         text-align: center;
    //         padding: 2px 0;
    //       }
    //       .barcode svg {
    //         max-width: 100%;
    //         height: 32px;
    //       }
    //       .sku {
    //         font-size: 6.5px;
    //         color: #5a5a5a;
    //         margin-bottom: 3px;
    //         font-family: 'Courier New', monospace;
    //         font-weight: 700;
    //         letter-spacing: 0.2px;
    //       }
    //       .footer {
    //         border-top: 1px solid #d0d0d0;
    //         padding-top: 3px;
    //         font-size: 5px;
    //         color: #666;
    //         line-height: 1.3;
    //         font-weight: 500;
    //       }
    //       .email {
    //         color: #1a472a;
    //         font-weight: 700;
    //         margin-bottom: 1px;
    //       }

    //       @media print {
    //         * { margin: 0 !important; padding: 0 !important; }
    //         body {
    //           margin: 0 !important;
    //           padding: 3px !important;
    //           background: white !important;
    //         }
    //         .tag {
    //           margin: 0 !important;
    //           page-break-after: avoid;
    //           width: 2in !important;
    //           height: 3in !important;
    //           border: 1px solid #2c3e50 !important;
    //           padding: 10px !important;
    //           box-shadow: none !important;
    //         }
    //       }
    //     </style>
    //   </head>
    //   <body>
    //     <div class="tag">
    //       <div class="header">
    //         <div class="company-name">VILOOM</div>
    //         <div class="brand">${product.brand}</div>
    //       </div>

    //       <div class="product">${product.name}</div>

    //       <div class="size-color">
    //         Size: ${variant.size} | ${variant.color}
    //       </div>

    //       <div class="price-section">
    //         <div class="price">₹${variant.price.toFixed(2)}</div>
    //         <div class="mrp-label">MRP (Inclusive of Tax)</div>
    //       </div>

    //       <div class="barcode">
    //         <svg id="barcode"></svg>
    //       </div>

    //       <div class="sku">${variant.sku}</div>

    //       <div class="footer">
    //         <div class="email">Support@Viloom.in</div>
    //         <div>Puzzle Theory Pvt Ltd</div>
    //         <div>Mandsaur, MP 458001</div>
    //       </div>
    //     </div>

    //     <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
    //     <script>
    //       const barcode = document.getElementById('barcode');
    //       if (barcode) {
    //         JsBarcode(barcode, "${variant.barcode}", {
    //           format: "CODE128",
    //           width: 1.5,
    //           height: 32,
    //           margin: 2
    //         });
    //       }
    //       setTimeout(() => {
    //         window.print();
    //       }, 300);
    //     <\/script>
    //   </body>
    //   </html>
    // `;
    const html = `
<!DOCTYPE html>
<html>
<head>
<title>VILOOM Tag</title>

<style>
@page {
  size: 2in 3in;
  margin: 0;
}

body {
  width: 2in;
  height: 3in;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.tag {
  width: 2in;
  height: 3in;
  padding: 12px;
  box-sizing: border-box;
  border: 2px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top {
  text-align: center;
}

.logo {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 4px;
}

.brand {
  font-size: 9px;
  margin-top: 4px;
  letter-spacing: 2px;
}

.product-name {
  margin-top: 10px;
  font-size: 12px;
  font-weight: bold;
}

.meta {
  margin-top: 6px;
  font-size: 9px;
  line-height: 1.4;
}

.price-section {
  text-align: center;
  margin: 10px 0;
}

.price {
  font-size: 26px;
  font-weight: 700;
}

.tax {
  font-size: 7px;
  margin-top: 3px;
}

.barcode {
  text-align: center;
  margin-top: 6px;
}

.barcode svg {
  width: 100%;
  height: 48px;
}

.sku {
  text-align: center;
  font-size: 8px;
  margin-top: 4px;
  letter-spacing: 1px;
}

.footer {
  border-top: 1px solid #000;
  padding-top: 6px;
  font-size: 7px;
  text-align: center;
  line-height: 1.3;
}

.label {
  font-weight: bold;
}

</style>
</head>

<body>

<div class="tag">

  <div class="top">
    <div class="logo">VILOOM</div>
    <div class="brand">${product.brand}</div>

    <div class="product-name">${product.name}</div>

    <div class="meta">
      <div><span class="label">Category:</span> ${product.category}</div>
      <div><span class="label">Size:</span> ${variant.size}</div>
      <div><span class="label">Color:</span> ${variant.color}</div>
    </div>
  </div>

  <div>
    <div class="price-section">
      <div class="price">₹${variant.price.toFixed(2)}</div>
      <div class="tax">MRP (Inclusive of all taxes)</div>
    </div>

    <div class="barcode">
      <svg id="barcode"></svg>
    </div>

    <div class="sku"><span class="label">SKU:</span> ${variant.sku}</div>
  </div>

  <div class="footer">
    Puzzle Theory Pvt Ltd<br/>
    Mandsaur, MP - 458001<br/>
    Support@Viloom.in
  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>

<script>
  JsBarcode("#barcode", "${variant.barcode}", {
    format: "CODE128",
    width: 3,
    height: 48,
    displayValue: false,
    margin: 0
  });

  setTimeout(() => window.print(), 300);
<\/script>

</body>
</html>
`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const categories = [
    "T-Shirts",
    "Jeans",
    "Shirts",
    "Dresses",
    "Jackets",
    "Accessories",
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Navy",
    "Gray",
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Products</h2>
            <p className="text-muted-foreground mt-1">
              Manage your inventory and create variants
            </p>
          </div>
          <div className="flex gap-2">
            {selectedItems.size > 0 && (
              <>
                <Button
                  onClick={handlePrintSelected}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print ({selectedItems.size})
                </Button>
                <Button
                  onClick={handleDeleteSelected}
                  className="bg-destructive hover:bg-destructive/90 text-white gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
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
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Product Name
                    </label>
                    <Input
                      placeholder="e.g., Denim Jeans"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Brand
                    </label>
                    <Input
                      placeholder="e.g., Azure"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Category
                    </label>
                    <Select
                      value={productCategory}
                      onValueChange={setProductCategory}
                    >
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
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card className="p-12 text-center border border-border">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                No products yet. Create your first product to get started.
              </p>
            </Card>
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                className="border border-border overflow-hidden"
              >
                {/* Product Header */}
                <div className="bg-secondary/50 p-6 border-b border-border flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {product.name}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        Brand:{" "}
                        <strong className="text-foreground">
                          {product.brand}
                        </strong>
                      </span>
                      <span>
                        Category:{" "}
                        <strong className="text-foreground">
                          {product.category}
                        </strong>
                      </span>
                      <span>
                        Variants:{" "}
                        <strong className="text-foreground">
                          {product.variants.length}
                        </strong>
                      </span>
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
                      <p className="text-muted-foreground mb-4">
                        No variants yet
                      </p>
                      <Dialog
                        open={newVariantProductId === product.id}
                        onOpenChange={(open) => {
                          if (!open) setNewVariantProductId(null);
                          else setNewVariantProductId(product.id);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-3 h-3 mr-2" />
                            Add Variant
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Add Variant - {product.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Size
                              </label>
                              <Select
                                value={variantSize}
                                onValueChange={setVariantSize}
                              >
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
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Color
                              </label>
                              <Select
                                value={variantColor}
                                onValueChange={setVariantColor}
                              >
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
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Price
                              </label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={variantPrice}
                                onChange={(e) =>
                                  setVariantPrice(e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Stock Quantity
                              </label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variantStock}
                                onChange={(e) =>
                                  setVariantStock(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              onClick={() => handleAddVariant(product.id)}
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                              disabled={
                                !variantSize ||
                                !variantColor ||
                                !variantPrice ||
                                !variantStock
                              }
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
                              <th className="text-left py-2 px-3 font-semibold text-foreground w-8">
                                <input
                                  type="checkbox"
                                  checked={
                                    product.variants.length > 0 &&
                                    product.variants.every((v) =>
                                      selectedItems.has(
                                        `${product.id}-${v.id}`,
                                      ),
                                    )
                                  }
                                  onChange={() =>
                                    toggleSelectAllProduct(product.id)
                                  }
                                  className="rounded cursor-pointer"
                                />
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">
                                Size
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">
                                Color
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">
                                SKU
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">
                                Price
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">
                                Stock
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-foreground">
                                Barcode
                              </th>
                              <th className="text-right py-2 px-3 font-semibold text-foreground">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((variant) => (
                              <tr
                                key={variant.id}
                                className="border-b border-border hover:bg-secondary/30"
                              >
                                <td className="py-3 px-3 w-8">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(
                                      `${product.id}-${variant.id}`,
                                    )}
                                    onChange={() =>
                                      toggleSelectItem(product.id, variant.id)
                                    }
                                    className="rounded cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-3 font-medium text-foreground">
                                  {variant.size}
                                </td>
                                <td className="py-3 px-3 text-muted-foreground">
                                  {variant.color}
                                </td>
                                <td className="py-3 px-3 font-mono text-sm text-foreground">
                                  {variant.sku}
                                </td>
                                <td className="py-3 px-3 font-medium text-foreground">
                                  ₹{variant.price.toFixed(2)}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {variant.stock}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="w-12 h-8 flex items-center">
                                    <svg
                                      ref={(ref) => {
                                        if (ref)
                                          barcodeRefs.current[variant.barcode] =
                                            ref;
                                      }}
                                      className="w-full h-full"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleGeneratePriceTag(product, variant)
                                    }
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteVariant(
                                        product.id,
                                        variant.id,
                                      )
                                    }
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
                      <Dialog
                        open={newVariantProductId === product.id}
                        onOpenChange={(open) => {
                          if (!open) setNewVariantProductId(null);
                          else setNewVariantProductId(product.id);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <Plus className="w-3 h-3 mr-2" />
                            Add Variant
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Add Variant - {product.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Size
                              </label>
                              <Select
                                value={variantSize}
                                onValueChange={setVariantSize}
                              >
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
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Color
                              </label>
                              <Select
                                value={variantColor}
                                onValueChange={setVariantColor}
                              >
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
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Price
                              </label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={variantPrice}
                                onChange={(e) =>
                                  setVariantPrice(e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-foreground mb-1 block">
                                Stock Quantity
                              </label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variantStock}
                                onChange={(e) =>
                                  setVariantStock(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              onClick={() => handleAddVariant(product.id)}
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                              disabled={
                                !variantSize ||
                                !variantColor ||
                                !variantPrice ||
                                !variantStock
                              }
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
