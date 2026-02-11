import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getTotalStats, getProducts, Product } from "@/lib/inventory";
import { getOrders, createOrder, updateOrderStatus, getSalesStats, Order } from "@/lib/orders";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, TrendingUp, Trash2, Plus, Check, X } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
}

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  todayOrders: number;
  todayRevenue: number;
  averageOrderValue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalVariants: 0, totalStock: 0 });
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  useEffect(() => {
    refreshData();

    const handleUpdate = () => refreshData();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("inventoryUpdated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("inventoryUpdated", handleUpdate);
    };
  }, []);

  const refreshData = () => {
    setStats(getTotalStats());
    setProducts(getProducts());
    setOrders(getOrders());
    setSalesStats(getSalesStats());
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm("Delete this order?")) {
      // For now, just update status - in production would delete from DB
      updateOrderStatus(id, "cancelled");
      refreshData();
      window.dispatchEvent(new Event("inventoryUpdated"));
    }
  };

  const handleCompleteOrder = (id: string) => {
    updateOrderStatus(id, "completed");
    refreshData();
    window.dispatchEvent(new Event("inventoryUpdated"));
  };

  const StatCard = ({ icon: Icon, label, value, color, subtext }: { icon: any; label: string; value: string | number; color: string; subtext?: string }) => (
    <Card className="p-4 border border-border bg-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Card>
  );

  const lowStockProducts = products.filter((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
    return totalStock < 5;
  });

  return (
    <Layout>
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground mt-1">Inventory & Order Management</p>
            </div>
            <div className="flex gap-2">
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Product
                </Button>
              </Link>
              <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Order</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Customer Name (Optional)</label>
                      <Input
                        placeholder="Customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        // Create a simple order for demo
                        if (products.length > 0 && products[0].variants.length > 0) {
                          const variant = products[0].variants[0];
                          createOrder(
                            [
                              {
                                variantId: variant.id,
                                productId: products[0].id,
                                productName: products[0].name,
                                size: variant.size,
                                color: variant.color,
                                quantity: 1,
                                price: variant.price,
                                total: variant.price,
                              },
                            ],
                            customerName || undefined
                          );
                          setCustomerName("");
                          setNewOrderOpen(false);
                          refreshData();
                          window.dispatchEvent(new Event("inventoryUpdated"));
                        }
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={products.length === 0}
                    >
                      Create Order
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Recent Orders */}
          <Card className="border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Recent Orders</h3>
              <span className="text-sm text-muted-foreground">{orders.length} total</span>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Items</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 8).map((order) => (
                        <tr key={order.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="py-3 px-4 font-mono text-xs font-medium text-foreground">{order.id}</td>
                          <td className="py-3 px-4 text-muted-foreground">{order.customerName || "—"}</td>
                          <td className="py-3 px-4 text-foreground">{order.items.length}</td>
                          <td className="py-3 px-4 font-medium text-foreground">₹{order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {order.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCompleteOrder(order.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Products Overview */}
          <Card className="border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Top Products</h3>
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
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Brand</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Variants</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => {
                        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                        return (
                          <tr key={product.id} className="border-b border-border hover:bg-secondary/30">
                            <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{product.brand}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {product.variants.length}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground">{totalStock}</td>
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

        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
          {/* Key Metrics */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">Key Metrics</h3>

            {salesStats && (
              <>
                <StatCard
                  icon={TrendingUp}
                  label="Total Revenue"
                  value={`₹${salesStats.totalRevenue.toFixed(0)}`}
                  color="bg-blue-500"
                  subtext={`${salesStats.completedOrders} completed`}
                />
                <StatCard
                  icon={ShoppingCart}
                  label="Today's Orders"
                  value={salesStats.todayOrders}
                  color="bg-green-500"
                  subtext={`₹${salesStats.todayRevenue.toFixed(0)} revenue`}
                />
                <StatCard
                  icon={Package}
                  label="Avg. Order"
                  value={`₹${salesStats.averageOrderValue.toFixed(0)}`}
                  color="bg-purple-500"
                  subtext="per order"
                />
              </>
            )}
          </div>

          {/* Inventory Summary */}
          <Card className="border border-border p-4">
            <h3 className="font-bold text-foreground text-sm mb-4 uppercase tracking-wide">Inventory</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Products</span>
                <span className="text-lg font-bold text-foreground">{stats.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Variants</span>
                <span className="text-lg font-bold text-foreground">{stats.totalVariants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Stock</span>
                <span className="text-lg font-bold text-foreground">{stats.totalStock}</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Min Order Stock</span>
                <span className="text-lg font-bold text-primary">&lt;5</span>
              </div>
            </div>
          </Card>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="font-bold text-yellow-900 text-sm mb-3">Low Stock Alert</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lowStockProducts.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  return (
                    <div key={product.id} className="text-sm">
                      <p className="font-medium text-yellow-900">{product.name}</p>
                      <p className="text-yellow-700">Stock: {totalStock}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">Quick Links</h3>
            <Link to="/products" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="w-4 h-4" />
                Manage Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
