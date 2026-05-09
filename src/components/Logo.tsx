import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Logo = ({ className, withText = true, size = "md" }: { className?: string; withText?: boolean; size?: "sm" | "md" | "lg" }) => {
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <Link to="/" className={cn("flex items-center group", className)}>
      {withText && (
        <span className={cn("font-display font-bold tracking-tight", text)}>
          Print<span className="text-gradient">Forge</span>
        </span>
      )}
    </Link>
  );
};
