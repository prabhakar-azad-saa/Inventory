import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTotalStats, getProducts, Product } from "@/lib/inventory";
import { Link } from "react-router-dom";
import { Package, Layers, Inbox, Plus } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalVariants: 0, totalStock: 0 });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const refreshStats = () => {
      setStats(getTotalStats());
      setProducts(getProducts());
    };

    refreshStats();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = () => {
      refreshStats();
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener("inventoryUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("inventoryUpdated", handleStorageChange);
    };
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
    <Card className="p-6 border border-border bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Welcome to your inventory management system</p>
          </div>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            color="bg-blue-500"
          />
          <StatCard
            icon={Layers}
            label="Total Variants"
            value={stats.totalVariants}
            color="bg-purple-500"
          />
          <StatCard
            icon={Inbox}
            label="Total Stock"
            value={stats.totalStock}
            color="bg-green-500"
          />
        </div>

        {/* Recent Products */}
        <Card className="border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">Recent Products</h3>
          </div>
          <div className="p-6">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Link to="/products">
                  <Button variant="outline">Create your first product</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Brand</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Variants</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((product) => {
                      const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                      return (
                        <tr key={product.id} className="border-b border-border hover:bg-secondary/50">
                          <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{product.brand}</td>
                          <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.variants.length}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground font-medium">{totalStock}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
