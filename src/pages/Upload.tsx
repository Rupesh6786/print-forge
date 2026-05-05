import { useState, useRef, DragEvent } from "react";
import { Upload as UploadIcon, FileBox, X, Check, Calculator, Layers, Clock, Weight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface FileMeta { name: string; sizeMB: number }

// Pricing: Mumbai-based rates (INR)
// Standard tier (PLA/PETG): ₹10–15/g material, ₹30–45/hr machine, ₹150 setup
// Premium tier (TPU/ABS): ₹20–30/g material, ₹60/hr machine, ₹250 setup
const materials = [
  { id: "PLA", name: "PLA", desc: "Standard · Easy, biodegradable, matte", density: 1.24, costPerGram: 12, machineRate: 38, setupFee: 150, tier: "Standard", color: "from-emerald-400 to-cyan-400" },
  { id: "PETG", name: "PETG", desc: "Standard · Strong, food-safe, glossy", density: 1.27, costPerGram: 14, machineRate: 42, setupFee: 150, tier: "Standard", color: "from-teal-400 to-sky-400" },
  { id: "ABS", name: "ABS", desc: "Premium · Tough, heat-resistant", density: 1.04, costPerGram: 25, machineRate: 60, setupFee: 250, tier: "Premium", color: "from-blue-400 to-indigo-500" },
  { id: "TPU", name: "TPU", desc: "Premium · Flexible, rubber-like", density: 1.21, costPerGram: 28, machineRate: 60, setupFee: 250, tier: "Premium", color: "from-violet-400 to-fuchsia-500" },
];

// Mumbai delivery: Local ₹80–150 (Dunzo/Borzo), Suburbs/Outstation ₹200+
const LOCAL_DELIVERY = 120;
const OUTSTATION_DELIVERY = 220;

const Upload = () => {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [dragging, setDragging] = useState(false);
  const [material, setMaterial] = useState("PLA");
  const [infill, setInfill] = useState([20]);
  const [quality, setQuality] = useState([0.2]); // layer height mm
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const accepted: FileMeta[] = [];
    for (const f of Array.from(incoming)) {
      if (!f.name.toLowerCase().endsWith(".stl")) {
        toast.error(`Skipped ${f.name} — not an STL file`);
        continue;
      }
      accepted.push({ name: f.name, sizeMB: +(f.size / 1024 / 1024).toFixed(2) });
    }
    if (accepted.length) {
      setFiles((prev) => [...prev, ...accepted]);
      toast.success(`${accepted.length} STL file${accepted.length > 1 ? "s" : ""} added`);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Pricing estimator (Mumbai INR rates) — sums across all uploaded files
  const mat = materials.find((m) => m.id === material)!;
  const totalSizeMB = files.reduce((s, f) => s + f.sizeMB, 0);
  const volumeCm3 = totalSizeMB * 8;
  const effectiveVolume = volumeCm3 * (0.3 + (infill[0] / 100) * 0.7);
  const weightG = +(effectiveVolume * mat.density).toFixed(1);
  const materialCost = +(weightG * mat.costPerGram).toFixed(2);
  const machineHours = +(volumeCm3 * (0.5 / quality[0])).toFixed(1) / 10;
  const machineCost = +(machineHours * mat.machineRate).toFixed(2);
  const setupFee = mat.setupFee;
  const deliveryFee = LOCAL_DELIVERY;
  const total = +(materialCost + machineCost + setupFee + deliveryFee).toFixed(2);

  return (
    <PageShell>
      <div className="container">
        <div className="max-w-3xl mb-10 animate-fade-up">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Upload your <span className="text-gradient">STL</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Drag, drop, configure. We'll print, finish, and ship it within 48 hours. Files upload securely to our DigitalOcean Spaces bucket.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Drop zone */}
          <div className="lg:col-span-3 space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative glass-card rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragging ? "border-primary shadow-glow scale-[1.01]" : "hover:border-primary/40"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".stl"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {files.length === 0 ? (
                <>
                  <div className="relative mx-auto h-20 w-20 rounded-2xl bg-aurora flex items-center justify-center mb-4 animate-glow-pulse">
                    <UploadIcon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Drop your .STL files here</h3>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse · select multiple · Max 100 MB each</p>
                  <Button variant="glass" type="button">Choose files</Button>
                </>
              ) : (
                <div className="space-y-2 text-left">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                      <div className="h-10 w-10 rounded-lg bg-aurora flex items-center justify-center shrink-0">
                        <FileBox className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{f.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{f.sizeMB} MB</div>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((_, i) => i !== idx)); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Click anywhere above to add more STL files
                  </p>
                </div>
              )}
            </div>

            {/* Material selector */}
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Material
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      material === m.id
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "glass hover:border-primary/40"
                    }`}
                  >
                    <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${m.color} mb-3`} />
                    <div className="font-display font-semibold flex items-center gap-2">
                      {m.name}
                      {material === m.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-2">₹{m.costPerGram}/g · {m.density} g/cm³</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Infill density</label>
                  <span className="font-mono text-sm text-primary">{infill[0]}%</span>
                </div>
                <Slider value={infill} onValueChange={setInfill} min={5} max={100} step={5} />
                <p className="text-xs text-muted-foreground mt-2">Higher = stronger but heavier and slower.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Layer height (quality)</label>
                  <span className="font-mono text-sm text-primary">{quality[0]} mm</span>
                </div>
                <Slider value={quality} onValueChange={setQuality} min={0.08} max={0.32} step={0.04} />
                <p className="text-xs text-muted-foreground mt-2">Lower = finer detail, longer print time.</p>
              </div>
            </div>
          </div>

          {/* Estimator */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 glass-card rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4 text-primary" />
                <span>Live pricing estimate</span>
              </div>

              {files.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Upload one or more STLs to see your quote
                </div>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground">{files.length} file{files.length > 1 ? "s" : ""} · {totalSizeMB.toFixed(2)} MB total</div>
                  <div className="grid grid-cols-3 gap-3">
                    <Stat icon={Weight} label="Weight" value={`${weightG}g`} />
                    <Stat icon={Clock} label="Time" value={`${machineHours}h`} />
                    <Stat icon={Layers} label="Volume" value={`${volumeCm3.toFixed(1)}cm³`} />
                  </div>

                  <div className="space-y-2 text-sm pt-2 border-t border-border/50">
                    <Row label={`Material (${material})`} value={`₹${materialCost}`} />
                    <Row label={`Machine time (₹${mat.machineRate}/hr)`} value={`₹${machineCost}`} />
                    <Row label={`Setup & QC (${mat.tier})`} value={`₹${setupFee}`} />
                    <Row label="Delivery (Mumbai local)" value={`₹${deliveryFee}`} />
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-end justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-display text-3xl font-bold text-gradient">₹{total}</span>
                    </div>
                  </div>

                  <Button
                    variant="aurora"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success("Quote locked in", { description: `Total: ₹${total}` })}
                  >
                    Continue to checkout
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Razorpay secure checkout · Free reprints if imperfect · Outstation delivery from ₹{OUTSTATION_DELIVERY}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof UploadIcon; label: string; value: string }) => (
  <div className="glass rounded-xl p-3 text-center">
    <Icon className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
    <div className="font-display font-bold text-sm">{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

export default Upload;
