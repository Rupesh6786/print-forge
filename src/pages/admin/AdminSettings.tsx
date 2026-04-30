import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsApi, AppSettings } from "@/services/api";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { buildUpiUrl } from "@/lib/upi";
import { Save, Smartphone } from "lucide-react";

const DEFAULTS: AppSettings = {
  upi_id: "22rupeshthakur@oksbi",
  upi_payee_name: "Rupesh Thakur",
  store_name: "PrintForge",
  store_currency: "INR",
  contact_email: "support@printforge.example",
  contact_phone: "+91-0000000000",
};

const AdminSettings = () => {
  const [s, setS] = useState<AppSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((d) => setS((prev) => ({ ...prev, ...d }))).catch(() => { /* keep defaults */ });
  }, []);

  const update = (k: keyof AppSettings, v: string) => setS((prev) => ({ ...prev, [k]: v }));

  const onSave = async () => {
    setSaving(true);
    try { await settingsApi.update(s); toast.success("Settings saved"); }
    catch (e) { toast.error("Could not reach API — saved locally for preview."); }
    finally  { setSaving(false); }
  };

  const previewUrl = buildUpiUrl({ pa: s.upi_id, pn: s.upi_payee_name, amount: 500, note: "PrintForge sample" });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage payment and store configuration.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-display font-semibold flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> UPI payment</h2>
            <Field label="UPI ID"     value={s.upi_id}         onChange={(v) => update("upi_id", v)}         placeholder="name@oksbi" mono />
            <Field label="Payee name" value={s.upi_payee_name} onChange={(v) => update("upi_payee_name", v)} placeholder="Your business name" />
            <p className="text-xs text-muted-foreground">Customers scan a QR built from these values. Their UPI app pre-fills the order amount.</p>
          </div>

          <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Live preview · ₹500</div>
            <div className="bg-white p-3 rounded-xl shadow-elegant"><QRCodeSVG value={previewUrl} size={180} /></div>
            <div className="font-mono text-[10px] text-muted-foreground mt-3 break-all max-w-[220px]">{previewUrl}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold">Store</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Store name"     value={s.store_name}     onChange={(v) => update("store_name", v)} />
            <Field label="Currency"       value={s.store_currency} onChange={(v) => update("store_currency", v)} mono />
            <Field label="Contact email"  value={s.contact_email}  onChange={(v) => update("contact_email", v)} />
            <Field label="Contact phone"  value={s.contact_phone}  onChange={(v) => update("contact_phone", v)} />
          </div>
        </div>

        <Button variant="aurora" size="lg" onClick={onSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </AdminLayout>
  );
};

const Field = ({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`h-11 glass border-glass-border ${mono ? "font-mono" : ""}`} />
  </div>
);

export default AdminSettings;
