import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users, ChevronLeft, Sun, Moon,
  Wrench, FileText, Mail, BarChart3, Settings as SettingsIcon, LogOut, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { RequireAdmin } from "@/components/admin/RequireAdmin";

const navItems = [
  { to: "/admin",           label: "Dashboard",         icon: LayoutDashboard, end: true },
  { to: "/admin/orders",    label: "Orders",            icon: ShoppingBag },
  { to: "/admin/services",  label: "Services",          icon: Wrench },
  { to: "/admin/quotes",    label: "Quotes",            icon: FileText },
  { to: "/admin/enquiries", label: "Enquiries",         icon: Mail },
  { to: "/admin/users",     label: "Users",             icon: Users },
  { to: "/admin/inventory", label: "Products",          icon: Package },
  { to: "/admin/analytics", label: "Product analytics", icon: BarChart3 },
  { to: "/admin/settings",  label: "Settings",          icon: SettingsIcon },
];

const Inner = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClick}
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
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/60 bg-sidebar p-4 sticky top-0 h-screen">
        <div className="px-2 py-3 mb-4"><Logo /></div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">Admin panel</div>
        <NavList />
        <div className="space-y-2 pt-4 border-t border-border/50">
          {user && (
            <div className="px-3 py-2 text-xs">
              <div className="text-muted-foreground">Signed in</div>
              <div className="font-medium truncate">{user.displayName || user.email}</div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-start gap-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} Toggle theme
          </Button>
          <Button variant="ghost" size="sm" onClick={() => logout()} className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" /> Sign out
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
          <Logo size="sm" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-sidebar border-l border-border p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <Logo size="sm" />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></Button>
              </div>
              <NavList onClick={() => setMobileOpen(false)} />
              <Button variant="ghost" size="sm" onClick={() => logout()} className="w-full justify-start gap-2 mt-4 border-t border-border/50 pt-4">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }: { children: ReactNode }) => (
  <RequireAdmin><Inner>{children}</Inner></RequireAdmin>
);
