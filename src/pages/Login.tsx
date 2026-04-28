import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setToken } from "@/services/api";

const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulated — wire to api.auth.login / api.auth.register
    setTimeout(() => {
      setToken("demo-jwt-token");
      toast.success(mode === "login" ? "Welcome back" : "Account created");
      setLoading(false);
      navigate("/");
    }, 800);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative w-full max-w-md animate-scale-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-aurora flex items-center justify-center">
            <Box className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold">
            Nexus<span className="text-gradient">3D</span>
          </span>
        </Link>

        <div className="glass-card rounded-3xl p-8 shadow-elegant">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Sign in to your maker account" : "Join the Nexus3D community"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Name" icon={UserIcon} type="text" placeholder="Ada Lovelace" />
            )}
            <Field label="Email" icon={Mail} type="email" placeholder="you@example.com" />
            <Field label="Password" icon={Lock} type="password" placeholder="••••••••" />

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
            {mode === "login" ? "New to Nexus3D?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to our terms.
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, icon: Icon, type, placeholder }: { label: string; icon: typeof Mail; type: string; placeholder: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input type={type} placeholder={placeholder} required className="pl-10 h-11 glass border-glass-border" />
    </div>
  </div>
);

export default Login;
