import { Link } from "react-router-dom";
import { Github, Twitter, Instagram } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer className="border-t border-border/50 mt-32">
    <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="col-span-2 md:col-span-1">
        <div className="mb-4"><Logo /></div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Premium 3D printing on demand. Built for makers, engineers, and dreamers.
        </p>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3 text-sm">Shop</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/shop"      className="hover:text-primary">All Products</Link></li>
          <li><Link to="/upload"    className="hover:text-primary">Custom Print</Link></li>
          <li><Link to="/materials" className="hover:text-primary">Materials</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/about"   className="hover:text-primary">About</Link></li>
          <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
          <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
          <li><Link to="/terms"   className="hover:text-primary">Terms</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3 text-sm">Connect</h4>
        <div className="flex gap-2">
          <a href="https://twitter.com/printforge"    target="_blank" rel="noopener noreferrer" aria-label="Twitter"   className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:text-primary"><Twitter className="h-4 w-4" /></a>
          <a href="https://github.com/printforge"     target="_blank" rel="noopener noreferrer" aria-label="GitHub"    className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:text-primary"><Github className="h-4 w-4" /></a>
          <a href="https://instagram.com/printforge"  target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:text-primary"><Instagram className="h-4 w-4" /></a>
        </div>
        <p className="text-xs text-muted-foreground mt-4">support@printforge.space</p>
      </div>
    </div>
    <div className="border-t border-border/50">
      <div className="container py-6 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} PrintForge. All rights reserved.</span>
        <span>Crafted with precision · UPI payments</span>
      </div>
    </div>
  </footer>
);
