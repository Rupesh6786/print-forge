import { PageShell } from "@/components/layout/PageShell";
import { SEO } from "@/components/SEO";
import { Briefcase, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const openings = [
  { title: "Senior Print Operator",          loc: "Bengaluru · On-site",  type: "Full-time" },
  { title: "Frontend Engineer (React/TS)",   loc: "Remote, India",        type: "Full-time" },
  { title: "3D Designer (Parametric/CAD)",   loc: "Remote, India",        type: "Contract"  },
  { title: "Logistics & Fulfilment Lead",    loc: "Bengaluru · On-site",  type: "Full-time" },
];

const Careers = () => (
  <PageShell>
    <SEO
      title="Careers at PrintForge — Build the Future of On-Demand Manufacturing"
      description="Join PrintForge to build India's leading 3D printing marketplace. Open roles in engineering, design, operations, and logistics."
    />
    <section className="container max-w-4xl py-16 md:py-24">
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Build the <span className="text-gradient">future</span> of making.
      </h1>
      <p className="text-muted-foreground text-lg mt-4 max-w-2xl">
        We hire makers who care about the craft. Small team, fast loops, real ownership.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-12">
        {openings.map((o) => (
          <div key={o.title} className="glass-card rounded-2xl p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-aurora flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold">{o.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {o.loc} · {o.type}
              </p>
              <a href="mailto:careers@printforge.space?subject=Application — {o.title}" className="inline-block mt-3">
                <Button size="sm" variant="aurora">Apply</Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);
export default Careers;
