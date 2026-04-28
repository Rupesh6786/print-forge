import { AdminLayout } from "./AdminLayout";
import { FileText, Eye, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const quotes = [
  { id: "Q1042", name: "Rohan Mehta",  email: "rohan@example.com", material: "PLA",   weight: 84,  price: 1248, status: "new"      },
  { id: "Q1041", name: "Priya Nair",   email: "priya@example.com", material: "Resin", weight: 112, price: 2680, status: "reviewed" },
  { id: "Q1040", name: "Aarav Singh",  email: "aarav@example.com", material: "ABS",   weight: 56,  price: 990,  status: "approved" },
];

const AdminQuotes = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">3D Print Quotes</h1>
        <p className="text-muted-foreground">Customer requests with STL uploads.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Weight</th>
                <th className="px-4 py-3">Estimate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{q.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.name}</div>
                    <div className="text-xs text-muted-foreground">{q.email}</div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-muted">{q.material}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{q.weight}g</td>
                  <td className="px-4 py-3 font-semibold">₹{q.price}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{q.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export default AdminQuotes;
