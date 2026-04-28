import { AdminLayout } from "./AdminLayout";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const topProducts = [
  { name: "Voronoi Lamp",    views: 1240, sales: 84 },
  { name: "Dragon",          views: 980,  sales: 142 },
  { name: "Hex Planter",     views: 760,  sales: 96 },
  { name: "Phone Stand",     views: 640,  sales: 72 },
  { name: "Lithophane",      views: 520,  sales: 38 },
];

const materialMix = [
  { name: "PLA",   value: 58 },
  { name: "ABS",   value: 26 },
  { name: "Resin", value: 16 },
];
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(217 91% 60%)"];

const AdminAnalytics = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Product analytics</h1>
        <p className="text-muted-foreground">Performance & conversion across the catalogue.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display font-semibold mb-4">Top products — views vs sales</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display font-semibold mb-4">Material mix</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={materialMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                  {materialMix.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export default AdminAnalytics;
