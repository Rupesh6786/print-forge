import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { isAdminUid } from "@/lib/firebase";
import { Logo } from "@/components/Logo";

const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState<{ name: string; admin: boolean } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user, isAdmin } = useAuth();

  // If already signed in, bounce away.
  useEffect(() => {
    if (user) navigate(isAdmin ? "/admin" : "/", { replace: true });
  }, [user, isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = mode === "login"
        ? await login(email, password)
        : await register(name, email, password);
      const isAdminUser = isAdminUid(u.uid);
      setWelcome({ name: u.displayName || name || u.email || "Maker", admin: isAdminUser });
      // Animated message stays for ~1.6s, then redirect.
      setTimeout(() => {
        toast.success(isAdminUser ? "Welcome, Admin!" : "Welcome to PrintForge");
        navigate(isAdminUser ? "/admin" : (location.state?.from ?? "/"), { replace: true });
      }, 1600);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg.replace("Firebase: ", ""));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      {/* Animated welcome overlay */}
      {welcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-up">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center max-w-md mx-4 animate-scale-in shadow-elegant">
            <div className="mx-auto h-16 w-16 rounded-full bg-aurora flex items-center justify-center mb-4 animate-float">
              {welcome.admin ? <ShieldCheck className="h-8 w-8 text-primary-foreground" /> : <CheckCircle2 className="h-8 w-8 text-primary-foreground" />}
            </div>
            <h2 className="font-display text-3xl font-bold">
              {welcome.admin ? "Welcome, Admin" : "Welcome"}
            </h2>
            <p className="text-gradient font-display text-2xl font-semibold mt-1 animate-aurora bg-[length:200%_200%]">
              {welcome.name}
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              {welcome.admin ? "Loading your control panel…" : "Taking you home…"}
            </p>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-8"><Logo size="lg" /></div>

        <div className="glass-card rounded-3xl p-8 shadow-elegant">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Sign in to PrintForge" : "Join the PrintForge community"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Name" icon={UserIcon} type="text" placeholder="Ada Lovelace" value={name} onChange={setName} />
            )}
            <Field label="Email" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
            <Field label="Password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={setPassword} required minLength={6} />

            <Button variant="aurora" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? "Loading…" : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "New to PrintForge?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-medium hover:underline"
              type="button"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by Firebase Authentication. By continuing you agree to our terms.
        </p>
        <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
          <Link to="/" className="hover:text-primary">← Back to site</Link>
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, icon: Icon, type, placeholder, value, onChange, required, minLength }: {
  label: string; icon: typeof Mail; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean; minLength?: number;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} minLength={minLength} className="pl-10 h-11 glass border-glass-border" />
    </div>
  </div>
);

export default Login;
