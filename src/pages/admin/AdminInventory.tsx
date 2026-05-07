import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react";
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
import { ApiProduct, productImageUrl, productGalleryImageUrl, productsApi, categoriesApi, type ApiCategory } from "@/services/api";
import { toast } from "sonner";

interface FormState {
  name: string;
  tagline: string;
  description: string;
  price: string;
  stock: string;
  rating: string;
  materials: string;     // CSV
  colors: string;        // CSV of selected colors
  category_id: string;
  is_active: string;
  imageFile: File | null;
  galleryFiles: File[]; // additional images to upload after save
}
const blankForm: FormState = {
  name: "", tagline: "", description: "", price: "", stock: "0",
  rating: "0", materials: "PLA", colors: "", category_id: "", is_active: "1", imageFile: null, galleryFiles: [],
};

// Curated color palette admins can pick from
const COLOR_OPTIONS: { name: string; hex: string }[] = [
  { name: "Black",  hex: "#1a1a1a" },
  { name: "White",  hex: "#f5f5f5" },
  { name: "Grey",   hex: "#808080" },
  { name: "Red",    hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Green",  hex: "#16a34a" },
  { name: "Blue",   hex: "#2563eb" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Pink",   hex: "#ec4899" },
  { name: "Gold",   hex: "#d4af37" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Transparent", hex: "transparent" },
];

const AdminInventory = () => {
  const [list, setList]     = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ]           = useState("");
  const [open, setOpen]     = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm]     = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<ApiProduct | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{ id: number; image_url: string }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    productsApi.list()
      .then(setList)
      .catch((e) => toast.error("Could not load products: " + e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const filtered = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const openNew = () => {
    setEditing(null); setForm(blankForm); setPreview(null); setGallery([]); setOpen(true);
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
      colors: (p as any).colors ?? "",
      category_id: p.category_id ? String(p.category_id) : "",
      is_active: String(p.is_active ?? 1),
      imageFile: null,
      galleryFiles: [],
    });
    setPreview(productImageUrl(p.id));
    setOpen(true);
    setGalleryLoading(true);
    productsApi.images(p.id)
      .then((rows) => setGallery(rows.map((r) => ({ id: r.id, image_url: productGalleryImageUrl(r.id) }))))
      .catch(() => setGallery([]))
      .finally(() => setGalleryLoading(false));
  };

  const onPickImage = (file: File | null) => {
    setForm((f) => ({ ...f, imageFile: file }));
    setPreview(file ? URL.createObjectURL(file) : (editing ? productImageUrl(editing.id) : null));
  };

  const onPickGallery = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setForm((f) => ({ ...f, galleryFiles: [...f.galleryFiles, ...arr] }));
  };

  const removePendingGallery = (idx: number) =>
    setForm((f) => ({ ...f, galleryFiles: f.galleryFiles.filter((_, i) => i !== idx) }));

  const removeExistingGallery = async (imgId: number) => {
    try {
      await productsApi.removeImage(imgId);
      setGallery((g) => g.filter((x) => x.id !== imgId));
      toast.success("Image removed");
    } catch (e: any) { toast.error("Remove failed: " + e?.message); }
  };

  const uploadGalleryFor = async (productId: number | string, files: File[]) => {
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    await productsApi.uploadImages(productId, fd);
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
      fd.append("colors", form.colors || "");
      if (form.category_id) fd.append("category_id", form.category_id);
      fd.append("is_active", form.is_active);
      if (form.imageFile) fd.append("image", form.imageFile);

      if (editing) {
        await productsApi.update(editing.id, fd);
        await uploadGalleryFor(editing.id, form.galleryFiles);
        toast.success("Product updated");
      } else {
        if (!form.imageFile) { toast.error("Please choose a product image"); setSaving(false); return; }
        const created = await productsApi.create(fd);
        await uploadGalleryFor(created.id, form.galleryFiles);
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="h-10 glass w-full rounded-md px-2 text-sm bg-transparent border border-input"
                  >
                    <option value="">— None —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field label="Materials (CSV)" value={form.materials} onChange={(v) => setForm({ ...form, materials: v })} placeholder="PLA,ABS,Resin" mono />
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Available colors</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const selected = form.colors.split(",").map((s) => s.trim()).filter(Boolean);
                    const active = selected.includes(c.name);
                    return (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => {
                          const next = active ? selected.filter((s) => s !== c.name) : [...selected, c.name];
                          setForm({ ...form, colors: next.join(",") });
                        }}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                          active ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-border/60"
                          style={{ background: c.hex === "transparent" ? "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 8px 8px" : c.hex }}
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">Select every color this product can be printed in. Customers will pick from these on the product page.</p>
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={form.is_active === "1"}
                       onChange={(e) => setForm({ ...form, is_active: e.target.checked ? "1" : "0" })} />
                <Label htmlFor="active" className="text-sm">Active (visible in shop)</Label>
              </div>
            </div>
          </div>

          {/* Additional gallery images */}
          <div className="space-y-2 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Additional images {editing && `(${gallery.length} saved)`}
              </Label>
              <label className="text-xs text-primary hover:underline cursor-pointer">
                + Add images
                <input type="file" accept="image/*" multiple className="hidden"
                       onChange={(e) => onPickGallery(e.target.files)} />
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Upload as many product photos as you like. Customers will see them in the gallery on the product page.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {galleryLoading && <div className="col-span-full text-xs text-muted-foreground">Loading existing images…</div>}
              {gallery.map((g) => (
                <div key={g.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={g.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingGallery(g.id)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {form.galleryFiles.map((f, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted ring-2 ring-primary/40">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-primary-foreground rounded px-1">NEW</span>
                  <button type="button" onClick={() => removePendingGallery(i)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {gallery.length === 0 && form.galleryFiles.length === 0 && !galleryLoading && (
                <div className="col-span-full text-xs text-muted-foreground italic">No additional images yet.</div>
              )}
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
