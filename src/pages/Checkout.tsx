import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Copy, CheckCircle2, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/layout/PageShell";
import { buildUpiUrl } from "@/lib/upi";
import { settingsApi } from "@/services/api";
import { toast } from "sonner";

// Local fallback so the demo works before the backend is live.
const FALLBACK = { upi_id: "22rupeshthakur@oksbi", upi_payee_name: "Rupesh Thakur" };

const Checkout = () => {
  const [amount, setAmount] = useState<number>(500);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderRef] = useState(() => `PF${Date.now().toString().slice(-8)}`);
  const [upi, setUpi] = useState(FALLBACK);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((s) => setUpi({ upi_id: s.upi_id, upi_payee_name: s.upi_payee_name }))
      .catch(() => { /* keep fallback */ })
      .finally(() => setLoadingSettings(false));
  }, []);

  const upiUrl = useMemo(
    () => buildUpiUrl({
      pa: upi.upi_id,
      pn: upi.upi_payee_name,
      amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
      note: `PrintForge Order ${orderRef}`,
      txnRef: orderRef,
    }),
    [upi, amount, orderRef]
  );

  const copyUpi = async () => {
    await navigator.clipboard.writeText(upi.upi_id);
    setCopied(true);
    toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmPayment = () => {
    setPaid(true);
    toast.success("Payment confirmation submitted — admin will verify shortly.");
  };

  return (
    <PageShell>
      <section className="container py-12 md:py-20 max-w-5xl">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Pay securely via UPI. The QR code updates instantly with your amount.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order details */}
          <div className="glass-card rounded-3xl p-6 md:p-8 space-y-5">
            <h2 className="font-display text-xl font-semibold">Your details</h2>
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" className="h-11 glass border-glass-border" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 glass border-glass-border" />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className="h-11 glass border-glass-border font-mono text-lg" />
            </div>
            <div className="rounded-2xl bg-muted/40 p-4 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Order ref</span><span className="font-mono">{orderRef}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payee</span><span>{upi.upi_payee_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">UPI ID</span><span className="font-mono text-xs">{upi.upi_id}</span></div>
              <div className="flex justify-between text-base pt-2 border-t border-border/50 mt-2"><span className="font-medium">Total</span><span className="font-display font-bold">₹{amount.toFixed(2)}</span></div>
            </div>
          </div>

          {/* QR */}
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary mb-3">
              <Smartphone className="h-3.5 w-3.5" /> Scan with any UPI app
            </div>
            <div className="relative">
              {loadingSettings ? (
                <div className="h-[260px] w-[260px] flex items-center justify-center bg-muted/30 rounded-2xl">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl shadow-elegant">
                  <QRCodeSVG value={upiUrl} size={232} level="M" includeMargin={false} />
                </div>
              )}
              <div className="absolute inset-0 -z-10 bg-aurora blur-2xl opacity-30 rounded-full" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground max-w-xs">
              Open GPay, PhonePe, Paytm or any UPI app, scan the QR — the amount is pre-filled. After paying, tap confirm.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={copyUpi} className="gap-1.5">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy UPI ID"}
              </Button>
              <a href={upiUrl}>
                <Button variant="aurora" size="sm">Open in UPI app</Button>
              </a>
            </div>

            <Button onClick={confirmPayment} disabled={paid} variant="aurora" size="lg" className="w-full mt-6">
              {paid ? <><CheckCircle2 className="h-4 w-4" /> Submitted for verification</> : "I've completed payment"}
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Checkout;
