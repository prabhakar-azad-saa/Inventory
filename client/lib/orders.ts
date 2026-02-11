export interface OrderItem {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  customerName?: string;
}

const ORDERS_STORAGE_KEY = "orders_data";

function generateOrderId(): string {
  return `ORD-${Date.now()}`;
}

export function getOrders(): Order[] {
  const data = localStorage.getItem(ORDERS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(items: OrderItem[], customerName?: string): Order {
  const total = items.reduce((sum, item) => sum + item.total, 0);

  const order: Order = {
    id: generateOrderId(),
    items,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
    customerName,
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  return order;
}

export function updateOrderStatus(id: string, status: "pending" | "completed" | "cancelled"): Order | null {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) return null;

  order.status = status;
  saveOrders(orders);

  return order;
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== id);

  if (filtered.length === orders.length) return false;

  saveOrders(filtered);
  return true;
}

export function getSalesStats() {
  const orders = getOrders();
  const completedOrders = orders.filter((o) => o.status === "completed");

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const completedCount = completedOrders.length;

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    totalRevenue,
    totalOrders,
    completedOrders: completedCount,
    todayOrders: todayOrders.length,
    todayRevenue,
    averageOrderValue: completedCount > 0 ? totalRevenue / completedCount : 0,
  };
}
