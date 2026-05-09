import { PageShell } from "@/components/layout/PageShell";
import { SEO } from "@/components/SEO";

const Terms = () => (
  <PageShell>
    <SEO title="Terms of Service | PrintForge" description="The rules that govern your use of PrintForge." />
    <section className="container max-w-3xl py-16 md:py-24 prose prose-invert prose-sm">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      <h2>1. Orders & Payment</h2>
      <p>All orders are confirmed once UPI payment is received and verified by our team. Estimated delivery is 7 days unless otherwise stated.</p>
      <h2>2. Custom prints (STL)</h2>
      <p>You retain ownership of any STL you upload. PrintForge processes the file solely to print and ship your order; we never resell your design.</p>
      <h2>3. Reprint guarantee</h2>
      <p>If a print fails our QC, we reprint at no cost. Buyer remorse and personalised items are not eligible for refund.</p>
      <h2>4. Acceptable use</h2>
      <p>No firearms, weapons, IP-infringing models, or anything illegal in India.</p>
      <h2>5. Liability</h2>
      <p>PrintForge's liability is limited to the amount paid for the order in question.</p>
    </section>
  </PageShell>
);
export default Terms;
