import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, CheckCircle2, Clock, Truck, Calendar } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ordersStore, StoredOrder } from "@/lib/orders-store";

const statusIcon = {
  pending: Clock, printing: Package, shipped: Truck, delivered: CheckCircle2, cancelled: Clock,
};
const statusColor: Record<StoredOrder["status"], string> = {
  pending: "text-amber-500",
  printing: "text-primary",
  shipped: "text-blue-400",
  delivered: "text-emerald-400",
  cancelled: "text-destructive",
};

const MyOrders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { state: { from: "/my-orders" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setOrders(ordersStore.forUser(user.uid));
    const i = setInterval(() => setOrders(ordersStore.forUser(user.uid)), 3000);
    return () => clearInterval(i);
  }, [user]);

  if (!user) return null;

  return (
    <PageShell>
      <section className="container max-w-4xl py-12 md:py-20">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">My orders</h1>
        <p className="text-muted-foreground mb-8">Track payment verification, printing & delivery for every order.</p>

        {orders.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">No orders yet.</p>
            <Link to="/shop"><Button variant="aurora">Start shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const Icon = statusIcon[o.status];
              return (
                <div key={o.id} className="glass-card rounded-2xl p-5 md:p-6 animate-fade-up">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">{o.id}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs uppercase font-mono px-2 py-1 rounded-md border border-current/30 bg-current/10 ${statusColor[o.status]}`}>
                        <Icon className="h-3 w-3 inline mr-1" /> {o.status}
                      </span>
                      <span className={`text-[10px] uppercase font-mono ${o.payment_status === "paid" ? "text-emerald-400" : "text-amber-500"}`}>
                        Payment: {o.payment_status === "paid" ? "✓ Confirmed by admin" : "⏳ Awaiting verification"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm border-t border-border/40 pt-3">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span>{it.name} <span className="text-xs">({it.material} × {it.quantity})</span></span>
                        <span className="font-mono">₹{(it.unit_price * it.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Estimated delivery: <span className="text-foreground font-medium">{new Date(o.estimated_delivery).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="font-display text-xl font-bold text-gradient">₹{o.total_amount.toFixed(0)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
};
export default MyOrders;
