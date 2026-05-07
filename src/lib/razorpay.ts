/** Loads Razorpay's hosted Checkout script once and caches the promise. */
let loaderPromise: Promise<boolean> | null = null;
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as any).Razorpay) return Promise.resolve(true);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => { loaderPromise = null; resolve(false); };
    document.body.appendChild(s);
  });
  return loaderPromise;
}

export interface RazorpayOptions {
  key: string;
  amount: number;          // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}

export function openRazorpay(opts: RazorpayOptions) {
  const w = window as any;
  if (!w.Razorpay) throw new Error("Razorpay script not loaded");
  const rzp = new w.Razorpay(opts);
  rzp.open();
  return rzp;
}