import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "./AdminLayout";

const stats = [
  { label: "Revenue (30d)", value: "$24,891", delta: "+12.4%", icon: TrendingUp },
  { label: "Active orders", value: "47", delta: "+8", icon: ShoppingBag },
  { label: "Products", value: "128", delta: "+3", icon: Package },
  { label: "New users", value: "312", delta: "+24%", icon: Users },
];

const recent = [
  { id: "#NX-2847", customer: "Sarah Chen", item: "Voronoi Lamp Shade", amount: "$89", status: "printing" },
  { id: "#NX-2846", customer: "Marcus Webb", item: "Dragon (custom)", amount: "$156", status: "shipped" },
  { id: "#NX-2845", customer: "Aiko Tanaka", item: "Hex Planter ×6", amount: "$144", status: "pending" },
  { id: "#NX-2844", customer: "Liam O'Brien", item: "Drone Frame X4", amount: "$129", status: "delivered" },
];

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500",
  printing: "bg-primary/15 text-primary",
  shipped: "bg-blue-500/15 text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
};

const AdminOverview = () => (
  <AdminLayout>
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening at the print farm.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
            <div className="flex items-start justify-between">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> {s.delta}
              </span>
            </div>
            <div className="mt-4 font-display text-2xl md:text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <a href="/admin/orders" className="text-xs text-primary hover:underline">View all</a>
        </div>
        <div className="divide-y divide-border/40">
          {recent.map((o) => (
            <div key={o.id} className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                  <span className="font-medium truncate">{o.customer}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{o.item}</div>
              </div>
              <div className="font-mono text-sm">{o.amount}</div>
              <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded-md ${statusColor[o.status]}`}>
                {o.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminLayout>
);

export default AdminOverview;
