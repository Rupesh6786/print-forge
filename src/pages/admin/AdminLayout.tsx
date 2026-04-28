import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Box, ChevronLeft, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/users", label: "Users", icon: Users },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-sidebar p-4 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-aurora flex items-center justify-center">
            <Box className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold">
            Nexus<span className="text-gradient">3D</span>
          </span>
        </Link>

        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Admin</div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-aurora text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-start gap-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Toggle theme
          </Button>
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to site
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden glass border-b border-border/60 sticky top-0 z-40 px-4 h-14 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-aurora flex items-center justify-center">
              <Box className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 glass rounded-2xl p-1.5 flex justify-around">
          {navItems.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium",
                  active ? "bg-aurora text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">{children}</main>
      </div>
    </div>
  );
};
