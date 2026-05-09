/**
 * Local order store — used as a fallback so the full purchase flow
 * works in the preview before the DigitalOcean API is live.
 * When the backend is connected, the same shape is returned by
 * GET /admin/orders and GET /orders/mine.
 */
export interface StoredOrder {
  id: string;                 // PF-XXXXXXXX
  user_uid: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string;
  items: { productId: string; name: string; material: string; quantity: number; unit_price: number }[];
  total_amount: number;
  payment_method: "upi_qr" | "razorpay";
  payment_status: "pending" | "paid";
  payment_ref?: string;
  status: "pending" | "printing" | "shipped" | "delivered" | "cancelled";
  estimated_delivery: string; // ISO date
  created_at: string;         // ISO datetime
  notes?: string;
}

const KEY = "printforge_orders";

export const ordersStore = {
  all(): StoredOrder[] {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  },
  save(orders: StoredOrder[]) { localStorage.setItem(KEY, JSON.stringify(orders)); },
  add(o: StoredOrder) { const a = ordersStore.all(); a.unshift(o); ordersStore.save(a); },
  update(id: string, patch: Partial<StoredOrder>) {
    const a = ordersStore.all().map((x) => x.id === id ? { ...x, ...patch } : x);
    ordersStore.save(a);
  },
  forUser(uid: string | null) {
    return ordersStore.all().filter((o) => o.user_uid === uid);
  },
};

export const newOrderId = () => "PF-" + Date.now().toString().slice(-8);
export const estimatedDelivery = (days = 7) => {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString();
};
