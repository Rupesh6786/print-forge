import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Upload, Layers, Zap, ShieldCheck, Sparkles, Box, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/nexus/ProductCard";
import { featured as fallbackFeatured, type Product } from "@/data/products";
import { productsApi } from "@/services/api";
import { mapApiProduct } from "@/lib/product-mapper";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero-printer.jpg";

const stats = [
  { v: "12k+", l: "Prints shipped" },
  { v: "0.05mm", l: "Layer precision" },
  { v: "48h", l: "Avg turnaround" },
  { v: "4.9★", l: "Maker rating" },
];

const features = [
  { icon: Upload, t: "Upload any STL", d: "Drag, drop, instant quote. We handle PLA, ABS, and high-resolution resin." },
  { icon: Zap, t: "Lightning turnaround", d: "Most orders ship within 48 hours from our distributed print farm." },
  { icon: Layers, t: "Material engineered", d: "Pick by stiffness, heat resistance, or surface finish — we'll guide you." },
  { icon: ShieldCheck, t: "Quality guaranteed", d: "Every print is QC'd. If it's not perfect, we reprint it free." },
];

const Home = () => {
  const [featured, setFeatured] = useState<Product[]>(fallbackFeatured);
  useEffect(() => {
    productsApi.list()
      .then((rows) => setFeatured(rows.map(mapApiProduct).filter((p) => p.stock > 0).slice(0, 4)))
      .catch(() => { /* keep fallback */ });
  }, []);
  return (
  <PageShell>
    <SEO
      title="PrintForge — Premium 3D Printing Marketplace & Custom STL Service"
      description="Shop curated 3D-printed products or upload your STL for instant pricing in PLA, ABS, PETG, and resin. 48-hour turnaround, secure UPI checkout, reprint guarantee."
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PrintForge",
        url: "https://printforge.space",
        logo: "https://printforge.space/og-image.jpg",
        sameAs: ["https://twitter.com/printforge", "https://instagram.com/printforge"],
      }}
    />
    {/* HERO */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" aria-hidden />

      <div className="container relative pt-12 pb-20 md:pt-20 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Now printing in carbon-fiber nylon</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Print the
            <br />
            <span className="text-gradient animate-aurora bg-[length:200%_200%]">impossible</span>
            <br />
            on demand.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            A full-stack 3D printing studio in your pocket. Browse our curated marketplace or upload your own STL — we'll print, finish, and ship it within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/upload">
              <Button variant="aurora" size="xl" className="w-full sm:w-auto">
                <Upload className="h-5 w-5" />
                Upload STL
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="glass" size="xl" className="w-full sm:w-auto">
                Explore marketplace
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4 pt-8 border-t border-border/50">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-xl md:text-2xl font-bold text-gradient">{s.v}</div>
                <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative animate-scale-in">
          <div className="absolute -inset-8 bg-aurora opacity-30 blur-3xl rounded-full animate-glow-pulse" />
          <div className="relative glass-card rounded-3xl overflow-hidden shadow-elegant">
            <img
              src={heroImage}
              alt="3D printer creating a glowing geometric sculpture"
              width={1536}
              height={1024}
              className="w-full h-auto"
            />
            <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-aurora flex items-center justify-center shrink-0">
                <Box className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-mono">PRINTING · LAYER 247/512</div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-aurora w-[48%] animate-aurora bg-[length:200%_200%]" />
                </div>
              </div>
              <span className="font-mono text-xs text-primary">48%</span>
            </div>
          </div>
          {/* Floating chips */}
          <div className="hidden md:flex absolute -top-4 -right-4 glass rounded-xl px-3 py-2 text-xs font-mono animate-float">
            0.05mm
          </div>
          <div className="hidden md:flex absolute -bottom-6 -left-4 glass rounded-xl px-3 py-2 text-xs font-mono animate-float" style={{ animationDelay: "1.5s" }}>
            PLA · ABS · Resin
          </div>
        </div>
      </div>
    </section>

    {/* FEATURES */}
    <section className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Engineered for makers</h2>
        <p className="text-muted-foreground">Everything you need to go from idea to held-in-your-hand object.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.t} className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-500 hover:-translate-y-1 group">
            <div className="h-12 w-12 rounded-xl bg-aurora flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <f.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold mb-2">{f.t}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* FEATURED PRODUCTS */}
    <section className="container py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Featured prints</h2>
          <p className="text-muted-foreground mt-2">Handpicked from our maker community.</p>
        </div>
        <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {featured.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>

    {/* LITHOPHANE CTA */}
    <section className="container py-12">
      <div className="relative glass-card rounded-3xl p-8 md:p-14 overflow-hidden grid md:grid-cols-2 gap-8 items-center">
        <div className="absolute inset-0 bg-aurora opacity-10 animate-aurora bg-[length:200%_200%] pointer-events-none" />
        <div className="relative space-y-5">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium">
            <ImageIcon className="h-3.5 w-3.5 text-primary" /> New · Photo to lithophane
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Turn any photo into a <span className="text-gradient">glowing lithophane</span>
          </h2>
          <p className="text-muted-foreground">
            Upload a picture, pick your favourite filament colour, and we'll print a translucent lithophane that comes alive when backlit.
          </p>
          <Link to="/lithophane">
            <Button variant="aurora" size="xl">
              <ImageIcon className="h-5 w-5" /> Create a lithophane
            </Button>
          </Link>
        </div>
        <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 grid place-items-center overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <ImageIcon className="h-24 w-24 text-primary/70 relative" />
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="container py-20">
      <div className="relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden">
        <div className="absolute inset-0 bg-aurora opacity-10 animate-aurora bg-[length:200%_200%]" />
        <div className="relative text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Got an STL? <span className="text-gradient">Get a quote in seconds.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Drop your file, pick a material, and we'll calculate cost, weight, and print time instantly.
          </p>
          <Link to="/upload">
            <Button variant="aurora" size="xl">
              <Upload className="h-5 w-5" /> Start a custom print
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </PageShell>
  );
};

export default Home;
