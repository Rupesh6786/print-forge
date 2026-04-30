import { PageShell } from "@/components/layout/PageShell";
import { SEO } from "@/components/SEO";
import { Sparkles, Layers, Users, Award } from "lucide-react";

const values = [
  { icon: Sparkles, t: "Precision first", d: "0.05mm layers, dialed slicer profiles, calibrated machines." },
  { icon: Layers,   t: "Material breadth", d: "PLA, ABS, PETG, carbon-fibre nylon and high-resolution resin." },
  { icon: Users,    t: "Maker community", d: "Independent designers earn royalties on every print sold." },
  { icon: Award,    t: "Reprint guarantee", d: "If a print doesn't meet our QC, we reprint it on us." },
];

const About = () => (
  <PageShell>
    <SEO
      title="About PrintForge — India's Maker-First 3D Printing Studio"
      description="PrintForge is a precision 3D printing studio building a marketplace and on-demand print service for makers, engineers, and designers across India."
    />
    <section className="container max-w-4xl py-16 md:py-24">
      <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
        We print the <span className="text-gradient">impossible</span>.
      </h1>
      <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
        PrintForge started in a dorm-room corner with one Ender-3 and a stubborn refusal to ship anything we wouldn't keep. Today we run a distributed print farm, a maker marketplace, and a custom-quote pipeline that turns an STL into a finished, packaged object inside 48 hours.
      </p>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        Every order is QC'd, every reprint is free, and every designer in our marketplace earns a real cut. We're built for the people who actually use the printer.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-12">
        {values.map((v) => (
          <div key={v.t} className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-xl bg-aurora flex items-center justify-center mb-3">
              <v.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold mb-1">{v.t}</h3>
            <p className="text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);
export default About;
