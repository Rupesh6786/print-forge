import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, ShoppingCart, User, LogOut, LayoutDashboard, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/upload", label: "Upload STL" },
  { to: "/lithophane", label: "Lithophane" },
  { to: "/contact", label: "Contact" },
  { to: "/admin", label: "Dashboard" },
];

export const Navbar = () => {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    setSearchOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

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
          {/* Mobile: menu icon on the LEFT */}
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setSearchOpen((o) => !o)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </div>

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

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen((o) => !o)} className="rounded-lg hidden md:inline-flex" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-lg" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/cart">
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
              <>
                <Link to="/my-orders" className="sm:hidden">
                  <Button variant="ghost" size="icon" className="rounded-lg" aria-label="My orders">
                    <Package className="h-4 w-4" />
                  </Button>
                </Link>
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
              </>
            ) : (
              <>
                <Link to="/login" className="sm:hidden">
                  <Button variant="aurora" size="icon" className="rounded-lg" aria-label="Sign in">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="aurora" size="sm" className="gap-1.5">
                    <User className="h-4 w-4" /> Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {searchOpen && (
          <form onSubmit={submitSearch} className="glass rounded-2xl mt-2 p-2 flex items-center gap-2 animate-fade-up">
            <Search className="h-4 w-4 ml-2 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search prints, materials, categories…"
              className="flex-1 bg-transparent outline-none text-sm py-2"
            />
            <Button type="submit" variant="aurora" size="sm">Search</Button>
          </form>
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="md:hidden w-72 p-0 flex flex-col">
            <div className="px-4 pt-5 pb-3 border-b border-border/50">
              <Logo />
            </div>
            <div className="flex-1 overflow-y-auto py-2 px-2">
              {links.map((l) => (
                (l.to === "/admin" && !isAdmin) ? null : (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === l.to ? "bg-muted text-primary" : "hover:bg-muted/60"
                    )}
                  >
                    {l.label}
                  </Link>
                )
              ))}
              <div className="border-t border-border/50 mt-2 pt-2 flex flex-col">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      Signed in as <span className="text-foreground font-medium">{user.displayName || user.email}</span>
                    </div>
                    <Link to="/my-orders" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted/60 flex items-center gap-2">
                      <Package className="h-4 w-4" /> My orders
                    </Link>
                    <Link to="/cart" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted/60 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" /> Cart {count > 0 && <span className="ml-auto text-xs font-mono">{count}</span>}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted/60 flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setOpen(false); logout(); }}
                      className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted/60 flex items-center gap-2 text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="mt-1 px-2">
                    <Button variant="aurora" className="w-full"><User className="h-4 w-4" /> Sign in</Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
