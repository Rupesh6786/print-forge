import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Status = "pending" | "printing" | "shipped" | "delivered";

const orders: { id: string; customer: string; item: string; amount: string; status: Status }[] = [
  { id: "#PF-2847", customer: "Anaya Sharma",  item: "Voronoi Lamp Shade · PLA",   amount: "₹899",  status: "printing" },
  { id: "#PF-2846", customer: "Karthik R.",    item: "Custom Dragon · ABS",        amount: "₹1,560", status: "shipped" },
  { id: "#PF-2845", customer: "Meera P.",      item: "Hex Planter ×6 · PLA",       amount: "₹1,440", status: "pending" },
  { id: "#PF-2844", customer: "Vikram J.",     item: "Drone Frame X4 · ABS",       amount: "₹1,290", status: "delivered" },
  { id: "#PF-2843", customer: "Priya Sharma",  item: "Lithophane Frame · Resin",   amount: "₹599",  status: "printing" },
  { id: "#PF-2842", customer: "Diego Costa",   item: "Cyberpunk Helmet · PLA",     amount: "₹2,190", status: "pending" },
];

const statusOrder: Status[] = ["pending", "printing", "shipped", "delivered"];
const statusColor: Record<Status, string> = {
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  printing: "bg-primary/15 text-primary border-primary/30",
  shipped: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const AdminOrders = () => {
  const [data, setData] = useState(orders);
  const [filter, setFilter] = useState<Status | "all">("all");
  const filtered = filter === "all" ? data : data.filter((o) => o.status === filter);

  const advance = (id: string) => {
    setData((arr) =>
      arr.map((o) => {
        if (o.id !== id) return o;
        const next = statusOrder[Math.min(statusOrder.indexOf(o.status) + 1, statusOrder.length - 1)];
        toast.success(`${id} → ${next}`);
        return { ...o, status: next };
      })
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">Track and update fulfillment status</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["all", ...statusOrder] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === s ? "bg-aurora text-primary-foreground shadow-glow" : "glass hover:border-primary/40"
              }`}
            >
              {s} {s !== "all" && <span className="opacity-60 ml-1">({data.filter((o) => o.status === s).length})</span>}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl divide-y divide-border/40">
          {filtered.map((o) => (
            <div key={o.id} className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                  <span className="font-medium">{o.customer}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.item}</div>
              </div>
              <span className="font-mono">{o.amount}</span>
              <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded-md border ${statusColor[o.status]}`}>
                {o.status}
              </span>
              <Button variant="glass" size="sm" disabled={o.status === "delivered"} onClick={() => advance(o.id)}>
                Advance
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
