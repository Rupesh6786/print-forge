import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { quotesApi, stl } from "@/services/api";
import { toast } from "sonner";

interface Quote {
  id: number; customer_name: string; customer_email: string;
  material: string; weight_grams: number; estimated_price: number;
  status?: string; stl_upload_id?: number | null; created_at?: string;
}

const AdminQuotes = () => {
  const [list, setList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quotesApi.list()
      .then((rows) => setList(rows as Quote[]))
      .catch((e) => toast.error("Could not load quotes: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">3D Print Quotes</h1>
          <p className="text-muted-foreground">Customer requests with STL uploads.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No quotes yet.</div>
        ) : (
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
                    <th className="px-4 py-3 text-right">STL</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((q) => (
                    <tr key={q.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">Q-{q.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{q.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{q.customer_email}</div>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-muted">{q.material}</span></td>
                      <td className="px-4 py-3 font-mono text-xs">{q.weight_grams}g</td>
                      <td className="px-4 py-3 font-semibold">₹{q.estimated_price}</td>
                      <td className="px-4 py-3 text-right">
                        {q.stl_upload_id ? (
                          <a href={stl.fileUrl(q.stl_upload_id)} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Download</Button>
                          </a>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQuotes;
