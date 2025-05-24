
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppInitialization } from './hooks/useAppInitialization';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResponsiveProvider } from './contexts/ResponsiveContext';
import ErrorBoundary from './components/ErrorBoundary';

// Import all page components
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Restaurant from './pages/Restaurant';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Fitness from './pages/Fitness';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import MealDetail from './pages/MealDetail';
import MealDetailsPage from './pages/MealDetailsPage';
import LocationHistoryPage from './pages/LocationHistoryPage';
import QrScannerDemo from './pages/QrScannerDemo';
import PlatformUIDemo from './pages/PlatformUIDemo';
import StorageDemo from './pages/StorageDemo';
import Shop from './pages/Shop';
import NotFound from './pages/NotFound';

// Import customer page
import CustomerPage from './pages/Customer';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Initialize core services early
  useAppInitialization();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <ResponsiveProvider>
            <AuthProvider>
              <CartProvider>
                <Router>
                  <Routes>
                    {/* Main routes - using Index instead of Home */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* Customer/Shop routes */}
                    <Route path="/customer" element={<CustomerPage />} />
                    <Route path="/shop" element={<Shop />} />
                    
                    {/* Restaurant routes */}
                    <Route path="/restaurant/:id" element={<Restaurant />} />
                    
                    {/* Order routes */}
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    
                    {/* Meal routes */}
                    <Route path="/meal/:id" element={<MealDetail />} />
                    <Route path="/meals/:id" element={<MealDetailsPage />} />
                    
                    {/* Fitness routes */}
                    <Route path="/fitness" element={<Fitness />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<Admin />} />
                    
                    {/* Subscription routes */}
                    <Route path="/subscription" element={<Subscription />} />
                    
                    {/* Location routes */}
                    <Route path="/location-history" element={<LocationHistoryPage />} />
                    
                    {/* Demo routes */}
                    <Route path="/qr-scanner" element={<QrScannerDemo />} />
                    <Route path="/platform-demo" element={<PlatformUIDemo />} />
                    <Route path="/storage-demo" element={<StorageDemo />} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
                
                {/* Global UI components */}
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </ResponsiveProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
