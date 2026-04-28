import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products as seed } from "@/data/products";
import { toast } from "sonner";

const AdminInventory = () => {
  const [list, setList] = useState(seed);
  const [q, setQ] = useState("");
  const filtered = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">{list.length} products in catalog</p>
          </div>
          <Button variant="aurora" onClick={() => toast.info("Open new product modal")}>
            <Plus className="h-4 w-4" /> New product
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-10 glass" />
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[60px_2fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
            <span></span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span></span>
          </div>
          <div className="divide-y divide-border/40">
            {filtered.map((p) => (
              <div key={p.id} className="grid md:grid-cols-[60px_2fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center hover:bg-muted/30">
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{p.category} · ${p.price} · {p.stock} stock</div>
                </div>
                <div className="hidden md:block text-sm text-muted-foreground">{p.category}</div>
                <div className="hidden md:block font-mono">${p.price}</div>
                <div className="hidden md:block font-mono text-sm">{p.stock}</div>
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => toast.info("Edit " + p.name)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setList((l) => l.filter((x) => x.id !== p.id)); toast.success("Deleted"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
