import { Link } from "react-router-dom";
import logo from "@/assets/printforge-logo.png";
import { cn } from "@/lib/utils";

export const Logo = ({ className, withText = true, size = "md" }: { className?: string; withText?: boolean; size?: "sm" | "md" | "lg" }) => {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative">
        <div className={cn("absolute inset-0 bg-aurora rounded-lg blur-md opacity-50 group-hover:opacity-90 transition-opacity")} />
        <img src={logo} alt="PrintForge logo" width={40} height={40} className={cn("relative rounded-lg object-contain bg-background/40", dim)} />
      </div>
      {withText && (
        <span className={cn("font-display font-bold tracking-tight", text)}>
          Print<span className="text-gradient">Forge</span>
        </span>
      )}
    </Link>
  );
};
