import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const PageShell = ({ children, hideFooter = false }: { children: ReactNode; hideFooter?: boolean }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1 pt-24">{children}</main>
    {!hideFooter && <Footer />}
  </div>
);
