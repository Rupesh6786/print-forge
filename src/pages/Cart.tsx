import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const Cart = () => {
  const { items, total, updateQty, remove } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkout = () => {
    if (!user) { navigate("/login", { state: { from: "/checkout" } }); return; }
    navigate("/checkout");
  };

  return (
    <PageShell>
      <section className="container max-w-4xl py-12 md:py-20">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Your cart</h1>
        <p className="text-muted-foreground mb-8">{items.length === 0 ? "Cart is empty." : `${items.length} line item${items.length>1?"s":""}`}</p>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Your cart is waiting to be filled.</p>
            <Link to="/shop"><Button variant="aurora">Browse the shop</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.productId + it.material} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <img src={it.image} alt={it.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.material} · ₹{it.price.toFixed(0)} each</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="glass" size="icon" onClick={() => updateQty(it.productId, it.material, it.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-8 text-center font-mono">{it.quantity}</span>
                  <Button variant="glass" size="icon" onClick={() => updateQty(it.productId, it.material, it.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <div className="font-display font-bold w-20 text-right">₹{(it.price * it.quantity).toFixed(0)}</div>
                <Button variant="ghost" size="icon" onClick={() => remove(it.productId, it.material)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}

            <div className="glass-card rounded-2xl p-6 flex items-center justify-between mt-6">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                <div className="font-display text-3xl font-bold text-gradient">₹{total.toFixed(0)}</div>
              </div>
              <Button variant="aurora" size="lg" onClick={checkout}>
                {user ? "Checkout" : "Sign in to checkout"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
};
export default Cart;
