import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingBag, Plus, Trash2, MapPin, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/layout/PageShell";
import { ordersApi, paymentsApi } from "@/services/api";
import { loadRazorpayScript, openRazorpay } from "@/lib/razorpay";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ordersStore, newOrderId } from "@/lib/orders-store";
import { toast } from "sonner";
import axios from "axios";

type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

const ADDR_KEY = "pf_saved_addresses";
const loadAddresses = (): SavedAddress[] => {
  try { return JSON.parse(localStorage.getItem(ADDR_KEY) || "[]"); } catch { return []; }
};
const saveAddresses = (a: SavedAddress[]) => localStorage.setItem(ADDR_KEY, JSON.stringify(a));

const formatAddress = (a: { line1: string; line2?: string; city: string; state: string; pincode: string; country: string }) =>
  [a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`, a.country].filter(Boolean).join(", ");

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, total: cartSubtotal, clear } = useCart();
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [label, setLabel] = useState("Home");
  const [saveForLater, setSaveForLater] = useState(true);

  // Shipping & Calculation States
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string>("new");

  const [orderId] = useState(() => newOrderId());
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paidRef, setPaidRef] = useState<string | null>(null);

  const totalPayable = cartSubtotal + shippingCost;

  // Function to fetch shipping rates from your backend
  const fetchShippingRate = useCallback(async (pin: string) => {
    if (pin.length !== 6) return;
    setShippingLoading(true);
    try {
      const response = await axios.post("/shipping/calculate", {
        delivery_pincode: pin,
        weight: 0.5, // Standard weight, adjust based on cart items if needed
        total_value: cartSubtotal
      });

      if (response.data.success) {
        setShippingCost(response.data.rate);
        setEstimatedArrival(response.data.etd || response.data.estimated_delivery);
      }
    } catch (error) {
      console.error("Shipping calculation failed", error);
      toast.error("Could not calculate shipping for this pincode.");
      setShippingCost(0);
    } finally {
      setShippingLoading(false);
    }
  }, [cartSubtotal]);

  // Effect to trigger shipping calc on pincode change
  useEffect(() => {
    if (pincode.length === 6) {
      fetchShippingRate(pincode);
    } else {
      setShippingCost(0);
      setEstimatedArrival(null);
    }
  }, [pincode, fetchShippingRate]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { state: { from: "/checkout" } });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const a = loadAddresses();
    setSavedAddresses(a);
    if (a.length > 0) setSelectedId(a[0].id);
  }, []);

  const useSaved = (id: string) => {
    setSelectedId(id);
    if (id === "new") return;
    const a = savedAddresses.find((x) => x.id === id);
    if (!a) return;
    setLine1(a.line1); setLine2(a.line2 || ""); setCity(a.city);
    setStateName(a.state); setPincode(a.pincode); setCountry(a.country); setLabel(a.label);
  };

  const deleteSaved = (id: string) => {
    const next = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(next); saveAddresses(next);
    if (selectedId === id) setSelectedId(next[0]?.id || "new");
  };

  const validateForm = () => {
    if (!name || !email || !phone) { toast.error("Please fill all contact details"); return false; }
    if (!line1 || !city || !stateName || !pincode) { toast.error("Please complete the shipping address"); return false; }
    if (pincode.length !== 6) { toast.error("Please enter a valid 6-digit pincode"); return false; }
    if (items.length === 0) { toast.error("Cart is empty"); return false; }
    return true;
  };

  const persistOrder = async (paymentRef: string) => {
    const addressBlock = { line1, line2, city, state: stateName, pincode, country };
    const shipping_address = formatAddress(addressBlock);

    if (saveForLater && selectedId === "new") {
      const entry: SavedAddress = { id: crypto.randomUUID(), label: label || "Address", ...addressBlock };
      const next = [entry, ...savedAddresses];
      setSavedAddresses(next); saveAddresses(next);
    }

    try {
      await ordersApi.create({
        customer_name: name, customer_email: email, customer_phone: phone,
        shipping_address,
        total_amount: totalPayable, // Total including shipping
        shipping_charges: shippingCost,
        payment_method: "razorpay",
        notes: `payment_ref=${paymentRef}|edd=${estimatedArrival}`,
        items: items.map((i) => ({
          product_id: Number(i.productId) || null,
          product_name: i.name, material: i.material,
          quantity: i.quantity, unit_price: i.price,
        })),
      });
    } catch { /* Internal fallback */ }

    ordersStore.add({
      id: orderId,
      user_uid: user?.uid ?? null,
      customer_name: name, customer_email: email, customer_phone: phone,
      shipping_address,
      items: items.map((i) => ({
        productId: i.productId, name: i.name, material: i.material,
        quantity: i.quantity, unit_price: i.price,
      })),
      total_amount: totalPayable,
      payment_method: "razorpay",
      payment_status: "paid",
      status: "pending",
      estimated_delivery: estimatedArrival || "7-10 Days",
      created_at: new Date().toISOString(),
    });
    setSubmitted(true);
    clear();
    toast.success("Payment successful — order placed!");
    setTimeout(() => navigate("/my-orders"), 1500);
  };

  const payWithRazorpay = async () => {
    if (!validateForm()) return;
    if (shippingLoading) { toast.info("Please wait for shipping calculation..."); return; }
    
    setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { toast.error("Could not load Razorpay. Check your internet."); setPaying(false); return; }
      
      const order = await paymentsApi.createOrder(totalPayable, orderId, { app: "PrintForge" });
      
      openRazorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "PrintForge",
        description: `Order ${orderId}`,
        order_id: order.id,
        prefill: { name, email, contact: phone },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (resp) => {
          try {
            const v = await paymentsApi.verify(resp);
            if (!v.ok) throw new Error("Signature verification failed");
            setPaidRef(resp.razorpay_payment_id);
            await persistOrder(resp.razorpay_payment_id);
          } catch (e: any) {
            toast.error("Payment verification failed");
          } finally { setPaying(false); }
        },
      });
    } catch (e: any) {
      toast.error("Payment initialization failed");
      setPaying(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <PageShell>
      <section className="container py-12 md:py-20 max-w-6xl">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
          <div className="space-y-6">
            {/* Contact Details Card */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
              <h2 className="font-display text-xl font-semibold">Contact details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Phone Number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99999 99999" className="h-11 glass border-glass-border" /></div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Shipping address</h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-tight">Saved addresses</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {savedAddresses.map((a) => (
                      <div key={a.id} className={`relative rounded-xl border p-3 text-sm cursor-pointer transition ${selectedId === a.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => useSaved(a.id)}>
                        <div className="font-medium">{a.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{formatAddress(a)}</div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); deleteSaved(a.id); }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => { setSelectedId("new"); setLine1(""); setLine2(""); setCity(""); setStateName(""); setPincode(""); setLabel("Home"); }} className={`rounded-xl border-2 border-dashed p-3 text-sm flex items-center justify-center gap-2 transition ${selectedId === "new" ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      <Plus className="h-4 w-4" /> Add new
                    </button>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2"><Label>Address label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home / Office / Workshop" className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Address line 1</Label><Input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Building, Street, House No." className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Address line 2 (Optional)</Label><Input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Area, Landmark" className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>State</Label><Input value={stateName} onChange={(e) => setStateName(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <div className="relative">
                        <Input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} inputMode="numeric" maxLength={6} className="h-11 glass border-glass-border pr-10" />
                        {shippingLoading && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-primary" />}
                    </div>
                </div>
                <div className="space-y-1.5"><Label>Country</Label><Input value={country} disabled className="h-11 glass border-glass-border opacity-60" /></div>
              </div>

              {selectedId === "new" && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Save this address for future
                </label>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="glass-card rounded-3xl p-6 md:p-8 h-fit lg:sticky lg:top-24 space-y-6">
            <h2 className="font-display text-xl font-semibold uppercase tracking-tight">Order summary</h2>
            
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.productId + it.material} className="flex items-center gap-3 text-sm">
                  <img src={it.image} alt={it.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{it.material} · Qty: {it.quantity}</div>
                  </div>
                  <div className="font-mono">₹{(it.price * it.quantity).toFixed(0)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Subtotal</span>
                <span>₹{cartSubtotal.toFixed(0)}</span>
              </div>
              
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Shipping Fee</span>
                <span className={shippingCost === 0 && pincode.length === 6 ? "text-primary italic animate-pulse" : ""}>
                    {shippingLoading ? "Calculating..." : shippingCost > 0 ? `₹${shippingCost.toFixed(0)}` : "Enter Pincode"}
                </span>
              </div>

              {estimatedArrival && (
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 flex items-start gap-3 mt-1">
                      <Truck className="h-4 w-4 text-primary mt-1" />
                      <div>
                          <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Estimated Delivery</p>
                          <p className="text-sm font-medium">{estimatedArrival}</p>
                      </div>
                  </div>
              )}

              <div className="pt-2 flex justify-between items-center border-t border-border/50">
                <span className="font-semibold">Total Payable</span>
                <span className="font-display font-bold text-gradient text-3xl">₹{totalPayable.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                <CreditCard className="h-3 w-3" /> Secure Razorpay Checkout
              </div>
              
              <Button onClick={payWithRazorpay} disabled={submitted || paying || shippingLoading || pincode.length !== 6} variant="aurora" size="lg" className="w-full h-14 text-lg">
                {paying ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...</>
                 : submitted ? <><CheckCircle2 className="h-5 w-5 mr-2" /> Order Placed</>
                 : <>Pay ₹{totalPayable.toFixed(0)}</>}
              </Button>
              
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                By completing this purchase, you agree to our terms. Your order ID is <span className="font-mono text-foreground">{orderId}</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Checkout;