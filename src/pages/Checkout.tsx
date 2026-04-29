import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Copy, CheckCircle2, Smartphone, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/layout/PageShell";
import { buildUpiUrl } from "@/lib/upi";
import { settingsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ordersStore, newOrderId, estimatedDelivery } from "@/lib/orders-store";
import { toast } from "sonner";

const FALLBACK = { upi_id: "22rupeshthakur@oksbi", upi_payee_name: "Rupesh Thakur" };

const Checkout = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [orderId] = useState(() => newOrderId());
  const [upi, setUpi] = useState(FALLBACK);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const submitOrder = () => {
    if (!name || !email || !address) { toast.error("Please fill name, email and address"); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    ordersStore.add({
      id: orderId,
      user_uid: user?.uid ?? null,
      customer_name: name, customer_email: email, customer_phone: phone,
      shipping_address: address,
      items: items.map((i) => ({
        productId: i.productId, name: i.name, material: i.material,
        quantity: i.quantity, unit_price: i.price,
      })),
      total_amount: total,
      payment_method: "upi_qr",
      payment_status: "pending",
      status: "pending",
      estimated_delivery: estimatedDelivery(7),
      created_at: new Date().toISOString(),
    });
    setSubmitted(true);
    clear();
    toast.success("Order placed — admin will verify your payment shortly.");
    setTimeout(() => navigate("/my-orders"), 1500);
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
              <h2 className="font-display text-xl font-semibold">Shipping details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className="h-11 glass border-glass-border" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Shipping address</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Door no, street, city, PIN" className="glass border-glass-border min-h-[88px]" /></div>
              </div>
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

          {/* Right: QR */}
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col items-center text-center h-fit lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary mb-3">
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
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <div>Order <span className="font-mono text-foreground">{orderId}</span></div>
              <div>Payee: <span className="text-foreground">{upi.upi_payee_name}</span></div>
              <div>UPI: <span className="font-mono text-foreground">{upi.upi_id}</span></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={copyUpi} className="gap-1.5">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy UPI ID"}
              </Button>
              <a href={upiUrl}><Button variant="aurora" size="sm">Open in UPI app</Button></a>
            </div>

            <Button onClick={submitOrder} disabled={submitted} variant="aurora" size="lg" className="w-full mt-6">
              {submitted ? <><CheckCircle2 className="h-4 w-4" /> Order placed</> : "I've paid — place order"}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3 max-w-xs">
              After you tap above, your order is sent to the admin dashboard. The admin will verify the payment in your UPI account and mark it complete.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Checkout;
