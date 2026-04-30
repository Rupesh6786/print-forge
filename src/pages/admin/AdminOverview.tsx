import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { TrendingUp, ShoppingBag, Package, Users, IndianRupee, Wrench, FileText, Mail } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { adminApi, ordersApi } from "@/services/api";

const revenueData = [
  { d: "Mon", v: 14200 }, { d: "Tue", v: 18900 }, { d: "Wed", v: 16400 },
  { d: "Thu", v: 22500 }, { d: "Fri", v: 28100 }, { d: "Sat", v: 31200 }, { d: "Sun", v: 26800 },
];

const statusStyle: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-500",
  printing:  "bg-blue-500/10 text-blue-500",
  shipped:   "bg-violet-500/10 text-violet-500",
  delivered: "bg-emerald-500/10 text-emerald-500",
};

const AdminOverview = () => {
  const [s, setS] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });
  const [recent, setRecent] = useState<{ id: string; customer: string; amount: number; status: string }[]>([]);
  useEffect(() => {
    adminApi.stats().then(setS).catch(() => {});
    ordersApi.list()
      .then((r) => setRecent(r.slice(0, 4).map((o) => ({
        id: o.order_number, customer: o.customer_name, amount: Number(o.total_amount), status: o.status,
      }))))
      .catch(() => {});
  }, []);
  const stats = [
    { label: "Total revenue", value: `₹${s.revenue.toLocaleString("en-IN")}`, change: "live", icon: IndianRupee, accent: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Total orders",  value: String(s.orders),    change: "live",  icon: ShoppingBag, accent: "from-blue-500/20 to-blue-500/5" },
    { label: "Total products", value: String(s.products), change: "live",  icon: Package,     accent: "from-violet-500/20 to-violet-500/5" },
    { label: "Total users",   value: String(s.users),     change: "live",  icon: Users,       accent: "from-pink-500/20 to-pink-500/5" },
  ];
  return (
  <AdminLayout>
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Here's how PrintForge is doing today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`relative overflow-hidden glass-card rounded-2xl p-5`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} pointer-events-none`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="font-display text-2xl md:text-3xl font-bold mt-1">{s.value}</div>
                <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {s.change}</div>
              </div>
              <div className="h-9 w-9 rounded-lg bg-background/60 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { i: Wrench,   l: "Active services",  v: "4"  },
          { i: FileText, l: "Pending quotes",   v: "12" },
          { i: Mail,     l: "New enquiries",    v: "7"  },
          { i: Package,  l: "Low stock items",  v: "3"  },
        ].map((c) => (
          <div key={c.l} className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-aurora/10 flex items-center justify-center">
              <c.i className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{c.l}</div>
              <div className="font-display font-bold">{c.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold">Revenue this week</h2>
              <p className="text-xs text-muted-foreground">Daily total in ₹</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="d" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent orders */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display font-semibold mb-3">Recent orders</h2>
          <div className="space-y-2">
            {recent.length === 0 && <div className="text-xs text-muted-foreground py-4 text-center">No recent orders.</div>}
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <div className="text-sm font-medium">{o.customer}</div>
                  <div className="text-xs text-muted-foreground font-mono">#{o.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">₹{o.amount}</div>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${statusStyle[o.status]}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
  );
};

export default AdminOverview;
