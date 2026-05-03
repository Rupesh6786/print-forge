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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((l) => (
              <div key={l.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
                <a
                  href={lithophaneImageUrl(l.id)}
                  target="_blank" rel="noreferrer"
                  className="block aspect-square bg-muted relative group"
                >
                  <img
                    src={lithophaneImageUrl(l.id)}
                    alt={`Lithophane #${l.id}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-xs font-medium">Click to open / download</span>
                  </div>
                </a>
                <div className="p-4 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="font-display font-semibold">#{l.id} · {l.customer_name}</div>
                    <a
                      href={lithophaneImageUrl(l.id)}
                      download={`lithophane-${l.id}.${(l.image_mime || "image/jpeg").split("/")[1]}`}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>{l.customer_email}</div>
                    {l.customer_phone && <div>{l.customer_phone}</div>}
                    <div className="font-mono">Color: {l.color} · Size: {l.size}</div>
                    {l.notes && <div className="italic">"{l.notes}"</div>}
                    <div>{new Date(l.created_at).toLocaleString()}</div>
                  </div>
                  <div className="mt-auto">
                    <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as any)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLithophanes;
