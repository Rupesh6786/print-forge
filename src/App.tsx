import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Upload from "./pages/Upload.tsx";
import Login from "./pages/Login.tsx";
import Checkout from "./pages/Checkout.tsx";
import Cart from "./pages/Cart.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminInventory from "./pages/admin/AdminInventory.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminServices from "./pages/admin/AdminServices.tsx";
import AdminQuotes from "./pages/admin/AdminQuotes.tsx";
import AdminEnquiries from "./pages/admin/AdminEnquiries.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
         <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/quotes" element={<AdminQuotes />} />
              <Route path="/admin/enquiries" element={<AdminEnquiries />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
         </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
