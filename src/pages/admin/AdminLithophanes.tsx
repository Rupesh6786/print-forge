import { useEffect, useState } from "react";
import { Loader2, Download, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { lithophaneApi, lithophaneImageUrl, type ApiLithophane } from "@/services/api";
import { toast } from "sonner";

const STATUSES: ApiLithophane["status"][] = [
  "pending", "approved", "printing", "shipped", "completed", "cancelled",
];

const AdminLithophanes = () => {
  const [list, setList] = useState<ApiLithophane[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    lithophaneApi.list()
      .then(setList)
      .catch((e) => toast.error("Could not load lithophane orders: " + e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: number, status: ApiLithophane["status"]) => {
    try {
      await lithophaneApi.updateStatus(id, status);
      setList((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
      toast.success("Status updated");
    } catch (e: any) { toast.error("Update failed: " + e?.message); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Lithophane orders</h1>
            <p className="text-muted-foreground mt-1">{list.length} requests</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No lithophane requests yet.
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Specs</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((l) => (
                    <tr key={l.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <a href={lithophaneImageUrl(l.id)} target="_blank" rel="noreferrer">
                          <img src={lithophaneImageUrl(l.id)} alt={`Lithophane #${l.id}`}
                               className="h-14 w-14 rounded-md object-cover bg-muted" loading="lazy" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">#{l.id} · {l.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{l.customer_email}</div>
                        {l.customer_phone && <div className="text-xs text-muted-foreground">{l.customer_phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-mono">Color: {l.color}</div>
                        <div className="font-mono">Size: {l.size}</div>
                        {l.notes && <div className="italic text-muted-foreground mt-1 max-w-[220px] truncate">"{l.notes}"</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as any)}>
                          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={lithophaneImageUrl(l.id)}
                           download={`lithophane-${l.id}.${(l.image_mime || "image/jpeg").split("/")[1]}`}>
                          <Button size="sm" variant="ghost" className="gap-1.5">
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
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

export default AdminLithophanes;
