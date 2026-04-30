import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { ordersStore, StoredOrder } from "@/lib/orders-store";
import { ordersApi, ApiOrder } from "@/services/api";
import { toast } from "sonner";

type Status = StoredOrder["status"];
const statusOrder: Status[] = ["pending", "printing", "shipped", "delivered"];
const statusColor: Record<Status, string> = {
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  printing: "bg-primary/15 text-primary border-primary/30",
  shipped: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

/** Convert an API order into the StoredOrder shape for unified rendering. */
const fromApi = (o: ApiOrder): StoredOrder & { _apiId: number } => ({
  _apiId: o.id,
  id: o.order_number,
  user_uid: null,
  customer_name: o.customer_name,
  customer_email: o.customer_email,
  customer_phone: o.customer_phone ?? undefined,
  shipping_address: o.shipping_address ?? undefined,
  items: [],
  total_amount: Number(o.total_amount) || 0,
  payment_method: "upi_qr",
  payment_status: o.payment_status === "paid" ? "paid" : "pending",
  payment_ref: o.payment_ref ?? undefined,
  status: (o.status as Status) ?? "pending",
  estimated_delivery: o.created_at,
  created_at: o.created_at,
  notes: o.notes ?? undefined,
});

const AdminOrders = () => {
  const [data, setData] = useState<(StoredOrder & { _apiId?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingApi, setUsingApi] = useState(false);
  const [filter, setFilter] = useState<Status | "all" | "unpaid">("all");

  const refresh = async () => {
    try {
      const rows = await ordersApi.list();
      setData(rows.map(fromApi));
      setUsingApi(true);
    } catch {
      setData(ordersStore.all());
      setUsingApi(false);
    } finally { setLoading(false); }
  };
  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 5000);
    return () => clearInterval(i);
  }, []);

  const filtered = data.filter((o) => {
    if (filter === "all") return true;
    if (filter === "unpaid") return o.payment_status === "pending";
    return o.status === filter;
  });

  const advance = async (o: StoredOrder & { _apiId?: number }) => {
    const next = statusOrder[Math.min(statusOrder.indexOf(o.status) + 1, statusOrder.length - 1)];
    try {
      if (usingApi && o._apiId) await ordersApi.updateStatus(o._apiId, next);
      else ordersStore.update(o.id, { status: next });
      toast.success(`${o.id} → ${next}`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };
  const markPaid = async (o: StoredOrder & { _apiId?: number }) => {
    try {
      const ref = `UPI-${Date.now()}`;
      if (usingApi && o._apiId) await ordersApi.markPaid(o._apiId, ref);
      else ordersStore.update(o.id, { payment_status: "paid", payment_ref: ref });
      toast.success(`Payment confirmed for ${o.id}`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            {usingApi ? "Live from API" : "Local preview store"} · verify UPI payments and update fulfillment status
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["all", "unpaid", ...statusOrder] as const).map((s) => {
            const count = s === "all" ? data.length : s === "unpaid" ? data.filter(o=>o.payment_status==="pending").length : data.filter(o=>o.status===s).length;
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                  filter === s ? "bg-aurora text-primary-foreground shadow-glow" : "glass hover:border-primary/40"
                }`}>
                {s} <span className="opacity-60 ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => (
              <div key={o.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                      <Badge variant="outline" className={statusColor[o.status]}>{o.status}</Badge>
                      <Badge variant="outline" className={o.payment_status === "paid" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-500 border-amber-500/30"}>
                        {o.payment_status === "paid" ? "✓ Paid" : "⏳ Awaiting payment"}
                      </Badge>
                    </div>
                    <div className="font-medium mt-1.5">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{o.customer_email}</span>
                      {o.customer_phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{o.customer_phone}</span>}
                      {o.shipping_address && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{o.shipping_address}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold text-gradient">₹{o.total_amount.toFixed(0)}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {o.items.length > 0 && (
                  <div className="border-t border-border/40 pt-3 space-y-1 text-sm">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span>{it.name} <span className="text-xs">({it.material} × {it.quantity})</span></span>
                        <span className="font-mono">₹{(it.unit_price * it.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/40">
                  {o.payment_status === "pending" && (
                    <Button variant="aurora" size="sm" onClick={() => markPaid(o)} className="gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Mark payment completed
                    </Button>
                  )}
                  <Button variant="glass" size="sm" disabled={o.status === "delivered"} onClick={() => advance(o)}>
                    Advance status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
