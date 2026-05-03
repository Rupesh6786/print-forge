import { useEffect, useRef, useState, type DragEvent } from "react";
import { Image as ImageIcon, Upload as UploadIcon, X, Check, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { lithophaneApi, servicesApi, type ApiService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const COLORS = [
  { id: "white",  label: "Pearl White",  hex: "#f5f5f0" },
  { id: "warm",   label: "Warm Ivory",   hex: "#f3e3c3" },
  { id: "amber",  label: "Amber Glow",   hex: "#e8a948" },
  { id: "rose",   label: "Rose Quartz",  hex: "#e6a4b4" },
  { id: "sky",    label: "Sky Blue",     hex: "#9bc6e6" },
  { id: "mint",   label: "Mint",         hex: "#b8e0c2" },
  { id: "violet", label: "Violet",       hex: "#a48bd8" },
  { id: "black",  label: "Graphite",     hex: "#2a2a2a" },
];

/** Fallback prices used when no matching services exist in the DB. */
const DEFAULT_SIZES = [
  { id: "small",  label: '4" × 4"',  price: 499 },
  { id: "medium", label: '6" × 6"',  price: 899 },
  { id: "large",  label: '8" × 8"',  price: 1499 },
];

/** Pull the first numeric value out of a price label like "₹ 899" or "From 1,499". */
const parsePrice = (label: string): number => {
  const m = (label || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
};

/** Convert services whose name contains "lithophane" into size options. */
const servicesToSizes = (services: ApiService[]) => {
  const litho = services.filter((s) => /lithophane/i.test(s.name));
  if (!litho.length) return null;
  return litho.map((s) => {
    // Strip the leading "Lithophane" word so the button shows the size only.
    const cleanLabel = s.name.replace(/lithophane\s*[-–:]?\s*/i, "").trim() || s.name;
    return { id: String(s.id), label: cleanLabel, price: parsePrice(s.price_label) };
  });
};

const Lithophane = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [color, setColor] = useState(COLORS[0].id);
  const [sizes, setSizes] = useState<{ id: string; label: string; price: number }[]>(DEFAULT_SIZES);
  const [size, setSize] = useState<string>(DEFAULT_SIZES[1].id);
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pull live lithophane prices from the services API; fallback to defaults.
  useEffect(() => {
    let cancelled = false;
    servicesApi.list()
      .then((rows) => {
        if (cancelled) return;
        const fromApi = servicesToSizes(rows);
        if (fromApi && fromApi.length) {
          setSizes(fromApi);
          setSize(fromApi[Math.min(1, fromApi.length - 1)].id);
        }
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const f = files[0];
    if (!/^image\//.test(f.type)) { toast.error("Please upload an image (JPG, PNG, WEBP)"); return; }
    if (f.size > 15 * 1024 * 1024) { toast.error("Image must be smaller than 15 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  const submit = async () => {
    if (!file)  return toast.error("Please upload a photo first");
    if (!name || !email) return toast.error("Name and email are required");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("color", color);
      fd.append("size", size);
      fd.append("customer_name", name);
      fd.append("customer_email", email);
      fd.append("customer_phone", phone);
      fd.append("notes", notes);
      const r = await lithophaneApi.create(fd);
      toast.success("Lithophane request submitted", { description: `Reference #${r.id}` });
      setFile(null); setPreview(null); setNotes("");
    } catch (e: any) {
      toast.error("Failed to submit", { description: e.message });
    } finally { setSubmitting(false); }
  };

  const selectedColor = COLORS.find((c) => c.id === color)!;
  const selectedSize  = sizes.find((s) => s.id === size) ?? sizes[0];

  if (!loading && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <PageShell>
      <SEO
        title="Custom Photo Lithophane — 3D-Printed Backlit Art | PrintForge"
        description="Upload a photo and we'll print a stunning translucent lithophane in your chosen filament colour. Glows beautifully when backlit."
      />
      <section className="container">
        <div className="max-w-3xl space-y-3 mb-8 animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Photo <span className="text-gradient">lithophane</span> studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your favourite picture, pick a filament colour, and we'll 3D-print a translucent panel that reveals the image when light shines through.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
          {/* Left: uploader + preview */}
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`glass-card rounded-3xl border-2 border-dashed transition-all cursor-pointer p-6 md:p-10 text-center ${
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              {preview ? (
                <div className="relative">
                  <div
                    className="rounded-2xl aspect-square mx-auto max-w-sm overflow-hidden grid place-items-center"
                    style={{ background: selectedColor.hex }}
                  >
                    <img
                      src={preview}
                      alt="Lithophane preview"
                      className="w-full h-full object-cover mix-blend-multiply opacity-90"
                      style={{ filter: "grayscale(1) contrast(1.2)" }}
                    />
                  </div>
                  <Button
                    variant="glass" size="sm" className="mt-4"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  >
                    <X className="h-4 w-4" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-aurora grid place-items-center">
                    <UploadIcon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="font-display text-xl font-semibold">Drop a photo here</div>
                  <p className="text-sm text-muted-foreground">JPG, PNG or WEBP · up to 15 MB. High-contrast portraits work best.</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Filament colour — {selectedColor.label}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`aspect-square rounded-xl border-2 transition-all ${color === c.id ? "border-primary shadow-glow scale-105" : "border-border"}`}
                    style={{ background: c.hex }}
                    aria-label={c.label}
                    title={c.label}
                  >
                    {color === c.id && <Check className="h-5 w-5 mx-auto text-primary-foreground mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="text-sm font-medium mb-3">Size</div>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      size === s.id ? "border-primary bg-primary/10 text-primary shadow-glow" : "glass hover:border-primary/50"
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[11px] font-mono opacity-70 mt-1">₹{s.price || "—"}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="text-sm font-medium">Your details</div>
              <Input placeholder="Full name"  value={name}  onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Email"      type="email"  value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Textarea placeholder="Notes for our team (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Estimated total</div>
                <div className="font-display text-3xl font-bold text-gradient">₹{selectedSize.price}</div>
              </div>
              <Button variant="aurora" size="lg" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon className="h-4 w-4" />}
                Submit request
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Once submitted, our team reviews your image, prepares the print, and contacts you with a final quote and shipping timeline.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Lithophane;