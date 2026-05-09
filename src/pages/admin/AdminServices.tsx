import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Wrench, Plus, IndianRupee, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiService, servicesApi } from "@/services/api";
import { toast } from "sonner";

const LOCAL_KEY = "printforge_services_local";
const seedLocal: ApiService[] = [
  { id: 1, name: "Custom STL print",  price_label: "From ₹150", description: "Upload an STL, we quote, print, and ship.", is_active: 1, sort_order: 1 },
  { id: 2, name: "3D model design",   price_label: "From ₹999", description: "We design custom 3D models from your sketch.", is_active: 1, sort_order: 2 },
  { id: 3, name: "Lithophane",        price_label: "₹599",      description: "Photo-to-light keepsake printing.", is_active: 1, sort_order: 3 },
  { id: 4, name: "Bulk B2B printing", price_label: "Custom",    description: "Volume pricing for production runs.", is_active: 1, sort_order: 4 },
];

const readLocal = (): ApiService[] => {
  try { const v = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null"); return Array.isArray(v) ? v : seedLocal; }
  catch { return seedLocal; }
};
const writeLocal = (rows: ApiService[]) => localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));

interface FormState {
  name: string;
  price_label: string;
  description: string;
  is_active: boolean;
  sort_order: string;
}
const blank: FormState = { name: "", price_label: "", description: "", is_active: true, sort_order: "0" };

const AdminServices = () => {
  const [list, setList]       = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingApi, setUsingApi] = useState(false);
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<ApiService | null>(null);
  const [form, setForm]       = useState<FormState>(blank);
  const [saving, setSaving]   = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiService | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const rows = await servicesApi.list();
      setList(rows); setUsingApi(true);
    } catch {
      setList(readLocal()); setUsingApi(false);
    } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (s: ApiService) => {
    setEditing(s);
    setForm({
      name: s.name, price_label: s.price_label,
      description: s.description ?? "", is_active: !!s.is_active,
      sort_order: String(s.sort_order ?? 0),
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name || !form.price_label) { toast.error("Name and price label are required"); return; }
    setSaving(true);
    const payload: Partial<ApiService> = {
      name: form.name, price_label: form.price_label,
      description: form.description, is_active: form.is_active ? 1 : 0,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (usingApi) {
        if (editing) { await servicesApi.update(editing.id, payload); toast.success("Service updated"); }
        else         { await servicesApi.create(payload);             toast.success("Service created"); }
      } else {
        const rows = readLocal();
        if (editing) {
          const next = rows.map((r) => r.id === editing.id ? { ...r, ...payload } as ApiService : r);
          writeLocal(next);
        } else {
          const id = Math.max(0, ...rows.map((r) => r.id)) + 1;
          writeLocal([...rows, { id, ...(payload as ApiService) }]);
        }
        toast.success(editing ? "Service updated (local)" : "Service created (local)");
      }
      setOpen(false); refresh();
    } catch (e: any) { toast.error("Save failed: " + e?.message); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    try {
      if (usingApi) await servicesApi.remove(confirmDel.id);
      else writeLocal(readLocal().filter((r) => r.id !== confirmDel.id));
      toast.success("Deleted");
      setConfirmDel(null); refresh();
    } catch (e: any) { toast.error("Delete failed: " + e?.message); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">{usingApi ? "Live from API" : "Local preview"} · configure the print services PrintForge offers.</p>
          </div>
          <Button variant="aurora" className="gap-1.5" onClick={openNew}><Plus className="h-4 w-4" /> New service</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">No services yet — click “New service”.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((s) => (
              <div key={s.id} className="glass-card rounded-2xl p-5 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-aurora flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display font-semibold truncate">{s.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1 whitespace-nowrap">
                      <IndianRupee className="h-3 w-3" />{s.price_label.replace(/^₹/, "")}
                    </span>
                  </div>
                  {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    {!s.is_active && <span className="text-[10px] uppercase tracking-wider text-amber-500 font-mono">disabled</span>}
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="gap-1.5"><Edit2 className="h-3 w-3" /> Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDel(s)} className="gap-1.5 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /> Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "New service"}</DialogTitle>
            <DialogDescription>Services appear on the homepage and the “Start a custom print” flow.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 glass" placeholder="Custom STL print" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Price label *</Label>
                <Input value={form.price_label} onChange={(e) => setForm({ ...form, price_label: e.target.value })} className="h-10 glass" placeholder="From ₹150" />
              </div>
              <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="h-10 glass font-mono" />
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass min-h-[88px]" />
            </div>
            <div className="flex items-center gap-2">
              <input id="svc-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <Label htmlFor="svc-active" className="text-sm">Active (visible to customers)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="aurora" onClick={submit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Create service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove <strong>{confirmDel?.name}</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminServices;
