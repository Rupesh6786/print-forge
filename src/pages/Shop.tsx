import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/nexus/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/services/api";
import { mapApiProduct } from "@/lib/product-mapper";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/data/products";
import { toast } from "sonner";

const Shop = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    productsApi.list()
      .then((rows) => { if (!cancelled) setList(rows.map(mapApiProduct)); })
      .catch(() => {
        if (!cancelled) {
          setList(fallbackProducts);
          toast.message("Showing demo catalogue (API unreachable)");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(list.map((p) => p.category)))],
    [list]
  );

  const filtered = useMemo(
    () =>
      list.filter(
        (p) =>
          (cat === "All" || p.category === cat) &&
          (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, cat, list]
  );

  return (
    <PageShell>
      <section className="container">
        <div className="max-w-3xl space-y-3 mb-8 animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            The <span className="text-gradient">marketplace</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Curated prints from our maker community. Every object is printed-to-order with your choice of material.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-8 sticky top-20 z-30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prints…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-12 glass border-glass-border"
            />
          </div>
          <Button variant="glass" size="lg" className="md:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-6 px-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                cat === c ? "bg-aurora text-primary-foreground shadow-glow" : "glass hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No prints match your search.</div>
        )}
      </section>
    </PageShell>
  );
};

export default Shop;
