import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Copy, CheckCircle2, Smartphone, Loader2, ShoppingBag, Plus, Trash2, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/layout/PageShell";
import { buildUpiUrl } from "@/lib/upi";
import { settingsApi } from "@/services/api";
import { ordersApi, paymentsApi } from "@/services/api";
import { loadRazorpayScript, openRazorpay } from "@/lib/razorpay";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ordersStore, newOrderId, estimatedDelivery } from "@/lib/orders-store";
import { toast } from "sonner";

const FALLBACK = { upi_id: "22rupeshthakur@oksbi", upi_payee_name: "Rupesh Thakur" };

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
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [label, setLabel] = useState("Home");
  const [saveForLater, setSaveForLater] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string>("new");

  const [orderId] = useState(() => newOrderId());
  const [upi, setUpi] = useState(FALLBACK);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payMethod, setPayMethod] = useState<"upi_qr" | "razorpay">("razorpay");
  const [paying, setPaying] = useState(false);
  const [paidRef, setPaidRef] = useState<string | null>(null);

  // Auth gate
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

  useEffect(() => {
    settingsApi.get()
      .then((s) => setUpi({ upi_id: s.upi_id, upi_payee_name: s.upi_payee_name }))
      .catch(() => { /* keep fallback */ })
      .finally(() => setLoadingSettings(false));
  }, []);

  const amount = total;

  const upiUrl = useMemo(
    () => buildUpiUrl({
      pa: upi.upi_id, pn: upi.upi_payee_name,
      amount: amount > 0 ? amount : 0,
      note: `PrintForge ${orderId}`, txnRef: orderId,
    }),
    [upi, amount, orderId]
  );

  const copyUpi = async () => {
    await navigator.clipboard.writeText(upi.upi_id);
    setCopied(true); toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    if (!name || !email) { toast.error("Please fill name and email"); return false; }
    if (!line1 || !city || !stateName || !pincode) { toast.error("Please complete the shipping address"); return false; }
    if (items.length === 0) { toast.error("Cart is empty"); return false; }
    return true;
  };

  const persistOrder = async (paymentRef: string | null, method: "upi_qr" | "razorpay") => {
    const addressBlock = { line1, line2, city, state: stateName, pincode, country };
    const shipping_address = formatAddress(addressBlock);

    if (saveForLater && selectedId === "new") {
      const entry: SavedAddress = { id: crypto.randomUUID(), label: label || "Address", ...addressBlock };
      const next = [entry, ...savedAddresses];
      setSavedAddresses(next); saveAddresses(next);
    }

    // Try to persist on the API first; always keep a local copy as fallback.
    try {
      await ordersApi.create({
        customer_name: name, customer_email: email, customer_phone: phone,
        shipping_address,
        total_amount: total,
        payment_method: method,
        notes: paymentRef ? `payment_ref=${paymentRef}` : null,
        items: items.map((i) => ({
          product_id: Number(i.productId) || null,
          product_name: i.name, material: i.material,
          quantity: i.quantity, unit_price: i.price,
        })),
      });
    } catch { /* preview/offline — fall back to local store */ }

    ordersStore.add({
      id: orderId,
      user_uid: user?.uid ?? null,
      customer_name: name, customer_email: email, customer_phone: phone,
      shipping_address,
      items: items.map((i) => ({
        productId: i.productId, name: i.name, material: i.material,
        quantity: i.quantity, unit_price: i.price,
      })),
      total_amount: total,
      payment_method: method,
      payment_status: method === "razorpay" ? "paid" : "pending",
      status: "pending",
      estimated_delivery: estimatedDelivery(7),
      created_at: new Date().toISOString(),
    });
    setSubmitted(true);
    clear();
    toast.success(method === "razorpay"
      ? "Payment successful — order placed!"
      : "Order placed — admin will verify your payment shortly.");
    setTimeout(() => navigate("/my-orders"), 1500);
  };

  const submitUpiOrder = async () => {
    if (!validateForm()) return;
    await persistOrder(null, "upi_qr");
  };

  const payWithRazorpay = async () => {
    if (!validateForm()) return;
    setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { toast.error("Could not load Razorpay. Check your internet."); setPaying(false); return; }
      const order = await paymentsApi.createOrder(total, orderId, { app: "PrintForge" });
      if (!order.keyId) { toast.error("Razorpay key not configured on server"); setPaying(false); return; }
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
            await persistOrder(resp.razorpay_payment_id, "razorpay");
          } catch (e: any) {
            toast.error("Payment verification failed: " + (e?.message || "unknown"));
          } finally { setPaying(false); }
        },
      });
    } catch (e: any) {
      toast.error("Could not start Razorpay: " + (e?.message || "unknown"));
      setPaying(false);
    }
  };

  if (authLoading || !user) return null;

  if (items.length === 0 && !submitted) {
    return (
      <PageShell>
        <section className="container max-w-2xl py-20 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add a product to begin checkout.</p>
          <Link to="/shop"><Button variant="aurora">Browse the shop</Button></Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container py-12 md:py-20 max-w-6xl">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Pay securely via UPI. The QR is pre-filled with your order amount.</p>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
          {/* Left: details + items */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
              <h2 className="font-display text-xl font-semibold">Contact details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className="h-11 glass border-glass-border" /></div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Shipping address</h2>
              </div>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Saved addresses</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {savedAddresses.map((a) => {
                      const active = selectedId === a.id;
                      return (
                        <div key={a.id} className={`relative rounded-xl border p-3 text-sm cursor-pointer transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => useSaved(a.id)}>
                          <div className="font-medium">{a.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{formatAddress(a)}</div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteSaved(a.id); }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                    <button type="button" onClick={() => { setSelectedId("new"); setLine1(""); setLine2(""); setCity(""); setStateName(""); setPincode(""); setLabel("Home"); }} className={`rounded-xl border-2 border-dashed p-3 text-sm flex items-center justify-center gap-2 transition ${selectedId === "new" ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      <Plus className="h-4 w-4" /> Add new address
                    </button>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2"><Label>Address label</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home / Office" className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Address line 1</Label><Input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Door no, building, street" className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Address line 2 <span className="text-muted-foreground">(optional)</span></Label><Input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark, area" className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>State</Label><Input value={stateName} onChange={(e) => setStateName(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>Pincode</Label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} inputMode="numeric" maxLength={10} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 glass border-glass-border" /></div>
              </div>

              {selectedId === "new" && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={saveForLater} onChange={(e) => setSaveForLater(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Save this address for future orders
                </label>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold mb-4">Order summary</h2>
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.productId + it.material} className="flex items-center gap-3 text-sm">
                    <img src={it.image} alt={it.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.material} × {it.quantity}</div>
                    </div>
                    <div className="font-mono">₹{(it.price * it.quantity).toFixed(0)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 mt-4 pt-4 flex justify-between text-base">
                <span className="font-medium">Total</span>
                <span className="font-display font-bold text-gradient text-2xl">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Right: payment */}
          <div className="glass-card rounded-3xl p-6 md:p-8 h-fit lg:sticky lg:top-24 space-y-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Payment method</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPayMethod("razorpay")}
                  className={`p-3 rounded-xl border text-sm flex items-center justify-center gap-2 transition ${payMethod === "razorpay" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
                  <CreditCard className="h-4 w-4" /> Razorpay
                </button>
                <button type="button" onClick={() => setPayMethod("upi_qr")}
                  className={`p-3 rounded-xl border text-sm flex items-center justify-center gap-2 transition ${payMethod === "upi_qr" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
                  <Smartphone className="h-4 w-4" /> UPI QR
                </button>
              </div>
            </div>

            {payMethod === "razorpay" ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                  <CreditCard className="h-3.5 w-3.5" /> Cards · UPI · Netbanking · Wallets
                </div>
                <div className="text-xs text-muted-foreground">Order <span className="font-mono text-foreground">{orderId}</span></div>
                <div className="font-display text-3xl font-bold text-gradient">₹{total.toFixed(0)}</div>
                <Button onClick={payWithRazorpay} disabled={submitted || paying} variant="aurora" size="lg" className="w-full">
                  {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening Razorpay…</>
                   : submitted ? <><CheckCircle2 className="h-4 w-4" /> Paid</>
                   : <>Pay ₹{total.toFixed(0)} securely</>}
                </Button>
                {paidRef && <p className="text-[11px] text-emerald-500 font-mono">Payment ID: {paidRef}</p>}
                <p className="text-[11px] text-muted-foreground">You will only proceed after payment is verified by our server.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                  <Smartphone className="h-3.5 w-3.5" /> Scan with any UPI app
                </div>
                <div className="relative">
                  {loadingSettings ? (
                    <div className="h-[260px] w-[260px] flex items-center justify-center bg-muted/30 rounded-2xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                  ) : (
                    <div className="bg-white p-4 rounded-2xl shadow-elegant"><QRCodeSVG value={upiUrl} size={232} level="M" /></div>
                  )}
                  <div className="absolute inset-0 -z-10 bg-aurora blur-2xl opacity-30 rounded-full" />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Order <span className="font-mono text-foreground">{orderId}</span></div>
                  <div>Payee: <span className="text-foreground">{upi.upi_payee_name}</span></div>
                  <div>UPI: <span className="font-mono text-foreground">{upi.upi_id}</span></div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={copyUpi} className="gap-1.5">
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy UPI ID"}
                  </Button>
                  <a href={upiUrl}><Button variant="aurora" size="sm">Open in UPI app</Button></a>
                </div>
                <Button onClick={submitUpiOrder} disabled={submitted} variant="aurora" size="lg" className="w-full">
                  {submitted ? <><CheckCircle2 className="h-4 w-4" /> Order placed</> : "I've paid — place order"}
                </Button>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  After you tap above, your order is sent to the admin dashboard. The admin will verify the payment in your UPI account and mark it complete.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Checkout;
