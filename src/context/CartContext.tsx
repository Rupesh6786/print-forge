import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;        // unit price in INR
  material: string;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: CartItem) => void;
  updateQty: (productId: string, material: string, qty: number) => void;
  remove: (productId: string, material: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | undefined>(undefined);
const KEY = "printforge_cart";

const sameLine = (a: CartItem, b: { productId: string; material: string }) =>
  a.productId === b.productId && a.material === b.material;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add: CartCtx["add"] = (item) => {
    setItems((cur) => {
      const idx = cur.findIndex((c) => sameLine(c, item));
      if (idx >= 0) {
        const copy = [...cur];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + item.quantity };
        return copy;
      }
      return [...cur, item];
    });
  };
  const updateQty: CartCtx["updateQty"] = (productId, material, qty) =>
    setItems((cur) => cur.map((c) => sameLine(c, { productId, material }) ? { ...c, quantity: Math.max(1, qty) } : c));
  const remove: CartCtx["remove"] = (productId, material) =>
    setItems((cur) => cur.filter((c) => !sameLine(c, { productId, material })));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return <Ctx.Provider value={{ items, count, total, add, updateQty, remove, clear }}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
