import { ApiProduct, productImageUrl } from "@/services/api";
import type { Product } from "@/data/products";

/** Map a MySQL/API product into the shape the UI components expect. */
export const mapApiProduct = (p: ApiProduct): Product => ({
  id: String(p.id),
  name: p.name,
  tagline: p.tagline ?? "",
  price: Number(p.price) || 0,
  image: productImageUrl(p.id),
  category: (p as any).category_name || "General",
  materials: ((p.materials || "PLA").split(",").map((m) => m.trim()).filter(Boolean) as Product["materials"]),
  stock: Number(p.stock) || 0,
  rating: Number(p.rating) || 0,
  description: p.description ?? "",
  colors: (p.colors || "").split(",").map((c) => c.trim()).filter(Boolean),
});
