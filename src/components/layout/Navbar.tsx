import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, ShoppingCart, User, LogOut, LayoutDashboard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/upload", label: "Upload STL" },
  { to: "/admin", label: "Dashboard" },
];

export const Navbar = () => {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container">
        <nav
          className={cn(
            "glass rounded-2xl flex items-center justify-between px-4 md:px-6 h-14 md:h-16 transition-all",
            scrolled && "shadow-elegant"
          )}
        >
          <Logo />

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-muted/60",
                  pathname === l.to ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/cart" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="rounded-lg relative" aria-label="Cart">
                <ShoppingCart className="h-4 w-4" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-aurora text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/my-orders">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Package className="h-4 w-4" /> My orders
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="aurora" size="sm" className="gap-1.5">
                      <LayoutDashboard className="h-4 w-4" /> Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-1.5">
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block">
                <Button variant="aurora" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" /> Sign in
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="md:hidden rounded-lg" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden glass rounded-2xl mt-2 p-3 animate-fade-up flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === l.to ? "bg-muted text-primary" : "hover:bg-muted/60"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/login" className="mt-2">
              <Button variant="aurora" className="w-full">Sign in</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
