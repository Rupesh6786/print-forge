// Build a UPI deep link per the NPCI UPI URI spec.
// Example: upi://pay?pa=22rupeshthakur@oksbi&pn=Rupesh%20Thakur&am=500&cu=INR
export const buildUpiUrl = ({
  pa,
  pn,
  amount,
  currency = "INR",
  note,
  txnRef,
}: {
  pa: string;
  pn: string;
  amount: number;
  currency?: string;
  note?: string;
  txnRef?: string;
}) => {
  const params = new URLSearchParams();
  params.set("pa", pa);
  params.set("pn", pn);
  params.set("am", amount.toFixed(2));
  params.set("cu", currency);
  if (note) params.set("tn", note);
  if (txnRef) params.set("tr", txnRef);
  // URLSearchParams encodes spaces as '+', UPI apps expect %20
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
};
