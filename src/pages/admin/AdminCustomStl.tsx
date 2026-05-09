import { useEffect, useState } from "react";
import { Loader2, Download, FileBox } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { stl, type ApiStlUpload } from "@/services/api";
import { toast } from "sonner";

const fmtKB = (b: number) => (b / 1024).toFixed(1) + " KB";

const AdminCustomStl = () => {
  const [list, setList] = useState<ApiStlUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stl.listAdmin()
      .then(setList)
      .catch((e) => toast.error("Could not load STL orders: " + e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Custom STL orders</h1>
          <p className="text-muted-foreground">{list.length} uploads · download originals to print</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
            <FileBox className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No STL orders yet.
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Estimate</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">STL</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">S-{s.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium truncate max-w-[220px]">{s.filename}</div>
                        <div className="text-xs text-muted-foreground font-mono">{fmtKB(s.size_bytes)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.customer_name || s.user_display_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{s.customer_email || s.user_email || ""}</div>
                        {s.customer_phone && <div className="text-xs text-muted-foreground">{s.customer_phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {s.material ? <span className="text-xs px-2 py-0.5 rounded bg-muted">{s.material}</span> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.estimated_price ? `₹${s.estimated_price}` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <a href={stl.fileUrl(s.id)} target="_blank" rel="noreferrer" download={s.filename}>
                          <Button size="sm" variant="ghost" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Download</Button>
                        </a>
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

export default AdminCustomStl;