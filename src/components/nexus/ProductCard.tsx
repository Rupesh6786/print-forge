import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Product } from "@/data/products";
import { Badge } from "@/components/ui/badge";

export const ProductCard = ({ product }: { product: Product }) => (
  <Link to={`/shop/${product.id}`} className="group block">
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-elegant">
      <div className="relative aspect-square overflow-hidden bg-muted/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground border-border">
          {product.category}
        </Badge>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{product.tagline}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {product.rating}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-lg font-bold text-gradient">${product.price}</span>
          <div className="flex gap-1">
            {product.materials.map((m) => (
              <span key={m} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Link>
);
