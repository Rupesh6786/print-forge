import { PageShell } from "@/components/layout/PageShell";
import { SEO } from "@/components/SEO";

const Privacy = () => (
  <PageShell>
    <SEO title="Privacy Policy | PrintForge" description="How PrintForge collects, stores, and uses your information." noIndex={false} />
    <section className="container max-w-3xl py-16 md:py-24 prose prose-invert prose-sm">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      <h2 className="mt-8">What we collect</h2>
      <p>We collect the minimum needed to ship your order: name, email, shipping address, phone, and an order history. Payment is via UPI — we never see your bank credentials.</p>
      <h2>Authentication</h2>
      <p>We use Firebase Authentication. Passwords are never stored on our servers — only a Firebase user ID is associated with your profile.</p>
      <h2>How we store data</h2>
      <p>Order, product, and account data lives in our Hostinger MySQL database, accessed through our DigitalOcean API server. Backups are encrypted at rest.</p>
      <h2>Your rights</h2>
      <p>You can request a copy or deletion of your data at any time by emailing <a href="mailto:privacy@printforge.space">privacy@printforge.space</a>.</p>
    </section>
  </PageShell>
);
export default Privacy;
