import { PageShell } from "@/components/layout/PageShell";
import { SEO } from "@/components/SEO";

const mats = [
  { name: "PLA",   tag: "Versatile · Eco-friendly", desc: "Plant-based, easy to print, great for display pieces, prototypes, and toys.", colors: 24, strength: "Medium" },
  { name: "ABS",   tag: "Tough · Heat-resistant",   desc: "Impact-resistant and dimensionally stable. Ideal for functional parts and enclosures.", colors: 12, strength: "High" },
  { name: "PETG",  tag: "Food-safe · Flexible",     desc: "Strong, slightly flexible, food-contact safe. Excellent for bottles and outdoor use.", colors: 10, strength: "High" },
  { name: "Resin", tag: "High-detail · Smooth",     desc: "SLA/MSLA resin captures sub-100µm details — jewellery, miniatures, dental models.", colors: 18, strength: "Brittle" },
  { name: "CF Nylon", tag: "Engineering grade",     desc: "Carbon-fibre-reinforced nylon. Stiff, light, used in drone frames and tooling.", colors: 2, strength: "Very high" },
  { name: "TPU",   tag: "Rubber-like",              desc: "Flexible filament for phone cases, gaskets, soles, and shock absorbers.", colors: 6, strength: "Flexible" },
];

const Materials = () => (
  <PageShell>
    <SEO
      title="3D Printing Materials — PLA, ABS, PETG, Resin, Nylon, TPU | PrintForge"
      description="Choose from PLA, ABS, PETG, high-resolution resin, carbon-fibre nylon, and TPU. PrintForge engineers each material profile for strength, finish, and accuracy."
    />
    <section className="container max-w-5xl py-16 md:py-24">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Materials.</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">Pick by strength, finish, or use case — we've calibrated profiles for every filament we ship.</p>

      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {mats.map((m) => (
          <div key={m.name} className="glass-card rounded-2xl p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl font-bold">{m.name}</h3>
              <span className="text-xs font-mono text-primary">{m.tag}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{m.desc}</p>
            <div className="flex justify-between mt-4 pt-3 border-t border-border/40 text-xs font-mono text-muted-foreground">
              <span>Colours: {m.colors}</span>
              <span>Strength: {m.strength}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);
export default Materials;
