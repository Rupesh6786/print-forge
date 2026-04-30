import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { enquiriesApi } from "@/services/api";
import { toast } from "sonner";

const Contact = () => {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!f.name || !f.email || !f.message) { toast.error("Name, email, and message are required"); return; }
    setSending(true);
    try {
      await enquiriesApi.create(f);
      toast.success("Enquiry sent — we'll get back to you within 1 business day.");
      setF({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e: any) {
      toast.error("Could not send: " + (e?.message ?? "unknown"));
    } finally { setSending(false); }
  };

  return (
    <PageShell>
      <SEO
        title="Contact PrintForge — Talk to Our 3D Printing Team"
        description="Get in touch with PrintForge for custom prints, bulk orders, partnerships, or support. We respond within one business day."
      />
      <section className="container max-w-5xl py-16 md:py-24 grid lg:grid-cols-[1fr_1.2fr] gap-10">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Talk to us.</h1>
          <p className="text-muted-foreground mt-3">Bulk orders, partnerships, or just curious — drop a line.</p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> support@printforge.space</div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +91 00000 00000</div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Bengaluru, India</div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-11 glass" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="h-11 glass" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="h-11 glass" /></div>
            <div className="space-y-1.5"><Label>Subject</Label><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className="h-11 glass" /></div>
          </div>
          <div className="space-y-1.5"><Label>Message</Label>
            <Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="glass min-h-[140px]" />
          </div>
          <Button variant="aurora" size="lg" onClick={submit} disabled={sending} className="w-full">
            {sending && <Loader2 className="h-4 w-4 animate-spin" />} Send enquiry
          </Button>
        </div>
      </section>
    </PageShell>
  );
};
export default Contact;
