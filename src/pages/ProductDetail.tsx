import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Truck, ShieldCheck, ShoppingCart, Box } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [material, setMaterial] = useState(product?.materials[0] ?? "PLA");
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <PageShell>
        <div className="container text-center py-20">
          <h1 className="font-display text-2xl">Product not found</h1>
          <Link to="/shop"><Button variant="aurora" className="mt-6">Back to shop</Button></Link>
        </div>
      </PageShell>
    );
  }

  const materialMultiplier = { PLA: 1, ABS: 1.15, Resin: 1.4 } as const;
  const total = (product.price * materialMultiplier[material as keyof typeof materialMultiplier] * qty).toFixed(2);

  return (
    <PageShell>
      <div className="container">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 bg-aurora opacity-20 blur-3xl rounded-full" />
            <div className="relative glass-card rounded-3xl overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
            </div>
          </div>

          <div className="space-y-6 animate-fade-up">
            <div>
              <Badge variant="outline" className="mb-3">{product.category}</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground mt-2">{product.tagline}</p>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" /> {product.rating}
                </div>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{product.stock} in stock</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="space-y-3">
              <label className="text-sm font-medium">Material</label>
              <div className="grid grid-cols-3 gap-2">
                {(["PLA", "ABS", "Resin"] as const).map((m) => {
                  const available = product.materials.includes(m);
                  const active = material === m;
                  return (
                    <button
                      key={m}
                      disabled={!available}
                      onClick={() => setMaterial(m)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-glow"
                          : available
                          ? "glass hover:border-primary/50"
                          : "opacity-30 cursor-not-allowed border-border"
                      }`}
                    >
                      <Box className="h-4 w-4 mx-auto mb-1" />
                      {m}
                      <div className="text-[10px] font-mono mt-0.5 opacity-70">
                        ×{materialMultiplier[m]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-3">
                <Button variant="glass" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Button>
                <span className="font-display text-xl w-12 text-center">{qty}</span>
                <Button variant="glass" size="icon" onClick={() => setQty((q) => q + 1)}>+</Button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-display text-3xl font-bold text-gradient">${total}</div>
              </div>
              <Button
                variant="aurora"
                size="lg"
                onClick={() => toast.success(`${product.name} added to cart`, { description: `${qty} × ${material}` })}
              >
                <ShoppingCart className="h-4 w-4" /> Add to cart
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="glass rounded-xl p-3 flex items-center gap-3">
                <Truck className="h-4 w-4 text-primary" />
                <div className="text-xs"><div className="font-medium">48h shipping</div><div className="text-muted-foreground">Worldwide</div></div>
              </div>
              <div className="glass rounded-xl p-3 flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <div className="text-xs"><div className="font-medium">Reprint guarantee</div><div className="text-muted-foreground">If imperfect</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ProductDetail;
