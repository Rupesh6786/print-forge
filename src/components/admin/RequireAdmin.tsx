import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/login", { replace: true });
    } else if (!isAdmin) {
      toast.error("Admin access required");
      navigate("/", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
};
