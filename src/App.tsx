import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Fitness from "./pages/Fitness";
import FitnessEnhanced from "./pages/FitnessEnhanced";
import Customer from "./pages/Customer";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Nutrition from "./pages/Nutrition";
import Orders from "./pages/Orders";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import RestaurantDashboard from "./pages/restaurant/Dashboard";
import RestaurantOrders from "./pages/restaurant/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ResponsiveProvider } from "./contexts/ResponsiveContext";
import { GoogleMapsProvider } from "./contexts/GoogleMapsContext";
import { SkipToContent } from "./components/accessibility/SkipToContent";
import ComplexOrderDemo from '@/pages/ComplexOrderDemo';

// Import delivery components
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import OnboardingPage from "./pages/delivery/OnboardingPage";
import DeliverySettings from "./pages/delivery/DeliverySettings";

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
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <ResponsiveProvider>
          <TooltipProvider>
            <AuthProvider>
              <CartProvider>
                <GoogleMapsProvider>
                  <SkipToContent />
                  <Toaster />
                  <Sonner />
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
                      <Route path="/orders/:id" element={
                        <ProtectedRoute allowedUserTypes={['customer']}>
                          <Navigate to={`/order-confirmation/${window.location.pathname.split('/').pop()}`} replace />
                        </ProtectedRoute>
                      } />
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
                      <Route path="/restaurant/dashboard" element={
                        <ProtectedRoute allowedUserTypes={['restaurant']}>
                          <RestaurantDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/restaurant/orders" element={
                        <ProtectedRoute allowedUserTypes={['restaurant']}>
                          <RestaurantOrders />
                        </ProtectedRoute>
                      } />
                      <Route path="/orders" element={
                        <ProtectedRoute allowedUserTypes={['customer']}>
                          <Orders />
                        </ProtectedRoute>
                      } />
                      <Route path="/fitness" element={<Fitness />} />
                      <Route path="/fitness-enhanced" element={<FitnessEnhanced />} />
                      <Route path="/complex-order-demo" element={<ComplexOrderDemo />} />
                      
                      {/* Delivery Routes */}
                      <Route path="/delivery/onboarding" element={
                        <ProtectedRoute allowedUserTypes={['delivery']}>
                          <OnboardingPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/delivery/dashboard" element={
                        <ProtectedRoute allowedUserTypes={['delivery']}>
                          <DeliveryDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/delivery/settings" element={
                        <ProtectedRoute allowedUserTypes={['delivery']}>
                          <DeliverySettings />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </div>
                </GoogleMapsProvider>
              </CartProvider>
            </AuthProvider>
          </TooltipProvider>
        </ResponsiveProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
