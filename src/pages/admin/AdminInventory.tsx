import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiProduct, productImageUrl, productsApi } from "@/services/api";
import { toast } from "sonner";

interface FormState {
  name: string;
  tagline: string;
  description: string;
  price: string;
  stock: string;
  rating: string;
  materials: string;     // CSV
  category_id: string;
  is_active: string;
  imageFile: File | null;
}
const blankForm: FormState = {
  name: "", tagline: "", description: "", price: "", stock: "0",
  rating: "0", materials: "PLA", category_id: "", is_active: "1", imageFile: null,
};

const AdminInventory = () => {
  const [list, setList]     = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]           = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm]     = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiProduct | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    productsApi.list()
      .then(setList)
      .catch((e) => toast.error("Could not load products: " + e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);

  const filtered = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const openNew = () => {
    setEditing(null); setForm(blankForm); setPreview(null); setOpen(true);
  };
  const openEdit = (p: ApiProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      stock: String(p.stock ?? 0),
      rating: String(p.rating ?? 0),
      materials: p.materials ?? "PLA",
      category_id: p.category_id ? String(p.category_id) : "",
      is_active: String(p.is_active ?? 1),
      imageFile: null,
    });
    setPreview(productImageUrl(p.id));
    setOpen(true);
  };

  const onPickImage = (file: File | null) => {
    setForm((f) => ({ ...f, imageFile: file }));
    setPreview(file ? URL.createObjectURL(file) : (editing ? productImageUrl(editing.id) : null));
  };

  const submit = async () => {
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("tagline", form.tagline);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock || "0");
      fd.append("rating", form.rating || "0");
      fd.append("materials", form.materials || "PLA");
      if (form.category_id) fd.append("category_id", form.category_id);
      fd.append("is_active", form.is_active);
      if (form.imageFile) fd.append("image", form.imageFile);

      if (editing) {
        await productsApi.update(editing.id, fd);
        toast.success("Product updated");
      } else {
        if (!form.imageFile) { toast.error("Please choose a product image"); setSaving(false); return; }
        await productsApi.create(fd);
        toast.success("Product created");
      }
      setOpen(false); refresh();
    } catch (e: any) {
      toast.error("Save failed: " + (e?.message ?? "unknown"));
    } finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    try {
      await productsApi.remove(confirmDel.id);
      toast.success("Deleted");
      setConfirmDel(null); refresh();
    } catch (e: any) { toast.error("Delete failed: " + e?.message); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-1">{list.length} products in catalogue</p>
          </div>
          <Button variant="aurora" onClick={openNew}><Plus className="h-4 w-4" /> New product</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-10 glass" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[60px_2fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
              <span></span><span>Product</span><span>Materials</span><span>Price</span><span>Stock</span><span></span>
            </div>
            <div className="divide-y divide-border/40">
              {filtered.map((p) => (
                <div key={p.id} className="grid md:grid-cols-[60px_2fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted/30">
                  <img src={productImageUrl(p.id)} alt={p.name} loading="lazy" className="h-12 w-12 rounded-lg object-cover bg-muted"
                       onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.3")} />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground md:hidden">{p.materials} · ₹{p.price} · {p.stock} stock</div>
                    {p.tagline && <div className="text-xs text-muted-foreground hidden md:block">{p.tagline}</div>}
                  </div>
                  <div className="hidden md:block text-xs text-muted-foreground">{p.materials}</div>
                  <div className="hidden md:block font-mono">₹{Number(p.price).toFixed(0)}</div>
                  <div className="hidden md:block font-mono text-sm">{p.stock}</div>
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmDel(p)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">No products yet — click “New product”.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create / edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update product details. Leave the image empty to keep the existing one." : "Add a new product to your catalogue. Image is required."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-[180px_1fr] gap-5">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Image</Label>
              <label className="aspect-square rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition cursor-pointer flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-xs">Click to upload</div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden"
                       onChange={(e) => onPickImage(e.target.files?.[0] ?? null)} />
              </label>
              {form.imageFile && <p className="text-[11px] text-muted-foreground mt-1 truncate">{form.imageFile.name}</p>}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name *"     value={form.name}     onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Price (₹) *" value={form.price}   onChange={(v) => setForm({ ...form, price: v })} type="number" />
              </div>
              <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="mt-1 glass min-h-[80px]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Stock"     value={form.stock}   onChange={(v) => setForm({ ...form, stock: v })} type="number" />
                <Field label="Rating"    value={form.rating}  onChange={(v) => setForm({ ...form, rating: v })} type="number" />
                <Field label="Category #" value={form.category_id} onChange={(v) => setForm({ ...form, category_id: v })} type="number" />
              </div>
              <Field label="Materials (CSV)" value={form.materials} onChange={(v) => setForm({ ...form, materials: v })} placeholder="PLA,ABS,Resin" mono />
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={form.is_active === "1"}
                       onChange={(e) => setForm({ ...form, is_active: e.target.checked ? "1" : "0" })} />
                <Label htmlFor="active" className="text-sm">Active (visible in shop)</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="aurora" onClick={submit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{confirmDel?.name}</strong> from the catalogue.
            </AlertDialogDescription>
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

const Field = ({
  label, value, onChange, type = "text", placeholder, mono,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean;
}) => (
  <div className="space-y-1">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
           className={`h-10 glass ${mono ? "font-mono" : ""}`} />
  </div>
);

export default AdminInventory;
