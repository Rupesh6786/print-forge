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
      <section className="container max-w-4xl py-8 md:py-20 px-4">
        <h1 className="font-display text-2xl md:text-4xl font-bold mb-1">Your cart</h1>
        <p className="text-muted-foreground text-sm mb-6 md:mb-8">
          {items.length === 0 ? "Cart is empty." : `${items.length} item${items.length > 1 ? "s" : ""}`}
        </p>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
            <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6 text-sm md:text-base">Your cart is waiting to be filled.</p>
            <Link to="/shop" className="w-full sm:w-auto inline-block">
              <Button variant="aurora" className="w-full sm:w-auto">Browse the shop</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div 
                key={it.productId + it.material} 
                className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative"
              >
                {/* Product Info Group */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img src={it.image} alt={it.name} className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm md:text-base">{it.name}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                      {it.material} · ₹{it.price.toFixed(0)} each
                    </div>
                  </div>
                  {/* Mobile-only Trash button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(it.productId, it.material)}
                    className="sm:hidden shrink-0 h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Interaction Group */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="glass" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => updateQty(it.productId, it.material, it.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-mono text-sm">{it.quantity}</span>
                    <Button 
                      variant="glass" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => updateQty(it.productId, it.material, it.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="font-display font-bold text-sm md:text-base text-right sm:w-20">
                      ₹{(it.price * it.quantity).toFixed(0)}
                    </div>
                    {/* Desktop Trash button */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(it.productId, it.material)}
                      className="hidden sm:flex h-9 w-9 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Section */}
            <div className="glass-card rounded-2xl p-5 md:p-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex justify-between sm:block">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total</div>
                  <div className="font-display text-2xl md:text-3xl font-bold text-gradient">₹{total.toFixed(0)}</div>
                </div>
                <Button 
                  variant="aurora" 
                  size="lg" 
                  onClick={checkout}
                  className="w-full sm:w-auto py-6 sm:py-2 text-base"
                >
                  {user ? "Checkout" : "Sign in to checkout"} 
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Cart;