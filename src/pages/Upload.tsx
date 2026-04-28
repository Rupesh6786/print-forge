import { useState, useRef, DragEvent } from "react";
import { Upload as UploadIcon, FileBox, X, Check, Calculator, Layers, Clock, Weight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface FileMeta { name: string; sizeMB: number }

const materials = [
  { id: "PLA", name: "PLA", desc: "Easy, biodegradable, matte", density: 1.24, costPerGram: 0.05, color: "from-emerald-400 to-cyan-400" },
  { id: "ABS", name: "ABS", desc: "Tough, heat-resistant", density: 1.04, costPerGram: 0.07, color: "from-blue-400 to-indigo-500" },
  { id: "Resin", name: "Resin", desc: "High-detail, smooth surface", density: 1.18, costPerGram: 0.18, color: "from-violet-400 to-fuchsia-500" },
];

const Upload = () => {
  const [file, setFile] = useState<FileMeta | null>(null);
  const [dragging, setDragging] = useState(false);
  const [material, setMaterial] = useState("PLA");
  const [infill, setInfill] = useState([20]);
  const [quality, setQuality] = useState([0.2]); // layer height mm
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.toLowerCase().endsWith(".stl")) {
      toast.error("Please upload an STL file");
      return;
    }
    setFile({ name: f.name, sizeMB: +(f.size / 1024 / 1024).toFixed(2) });
    toast.success("STL uploaded", { description: f.name });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Pricing estimator (simulated): volume ≈ sizeMB * 8 cm³, weight = volume × density × infill%
  const mat = materials.find((m) => m.id === material)!;
  const volumeCm3 = file ? file.sizeMB * 8 : 0;
  const effectiveVolume = volumeCm3 * (0.3 + (infill[0] / 100) * 0.7);
  const weightG = +(effectiveVolume * mat.density).toFixed(1);
  const materialCost = +(weightG * mat.costPerGram).toFixed(2);
  const machineHours = +(volumeCm3 * (0.5 / quality[0])).toFixed(1) / 10;
  const machineCost = +(machineHours * 2.5).toFixed(2);
  const setupFee = 5;
  const total = +(materialCost + machineCost + setupFee).toFixed(2);

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
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {!file ? (
                <>
                  <div className="relative mx-auto h-20 w-20 rounded-2xl bg-aurora flex items-center justify-center mb-4 animate-glow-pulse">
                    <UploadIcon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Drop your .STL file here</h3>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse · Max 100 MB</p>
                  <Button variant="glass" type="button">Choose file</Button>
                </>
              ) : (
                <div className="flex items-center gap-4 text-left">
                  <div className="h-14 w-14 rounded-xl bg-aurora flex items-center justify-center shrink-0">
                    <FileBox className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold truncate">{file.name}</div>
                    <div className="text-sm text-muted-foreground font-mono">{file.sizeMB} MB · ready to slice</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Material selector */}
            <div>
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Material
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
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
                    <div className="text-xs font-mono text-muted-foreground mt-2">${m.costPerGram}/g · {m.density} g/cm³</div>
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

              {!file ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Upload an STL to see your quote
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Stat icon={Weight} label="Weight" value={`${weightG}g`} />
                    <Stat icon={Clock} label="Time" value={`${machineHours}h`} />
                    <Stat icon={Layers} label="Volume" value={`${volumeCm3.toFixed(1)}cm³`} />
                  </div>

                  <div className="space-y-2 text-sm pt-2 border-t border-border/50">
                    <Row label={`Material (${material})`} value={`$${materialCost}`} />
                    <Row label={`Machine time`} value={`$${machineCost}`} />
                    <Row label="Setup & QC" value={`$${setupFee}`} />
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-end justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-display text-3xl font-bold text-gradient">${total}</span>
                    </div>
                  </div>

                  <Button
                    variant="aurora"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success("Quote locked in", { description: `Total: $${total}` })}
                  >
                    Continue to checkout
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Razorpay secure checkout · Free reprints if imperfect
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
