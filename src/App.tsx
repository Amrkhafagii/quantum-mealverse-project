
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Fitness from "./pages/Fitness";
import FitnessEnhanced from "./pages/FitnessEnhanced";
import Customer from "./pages/Customer";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Nutrition from "./pages/Nutrition";
import Orders from "./pages/Orders";
import QrScannerDemo from "./pages/QrScannerDemo";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ResponsiveProvider } from "./contexts/ResponsiveContext";
import { SkipToContent } from "./components/accessibility/SkipToContent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ResponsiveProvider>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <SkipToContent />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div id="main-content">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:id" element={
                    <ProtectedRoute allowedUserTypes={['customer']}>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  } />
                  <Route path="/qr-scanner" element={<QrScannerDemo />} />
                  <Route path="/nutrition" element={<Nutrition />} />
                  <Route path="/customer" element={
                    <ProtectedRoute allowedUserTypes={['customer']}>
                      <Customer />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedUserTypes={['customer']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute allowedUserTypes={['customer']}>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/fitness" element={<Fitness />} />
                  <Route path="/fitness-enhanced" element={<FitnessEnhanced />} />
                  {/* Add more routes as needed */}
                </Routes>
              </div>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </ResponsiveProvider>
  </QueryClientProvider>
);

export default App;
