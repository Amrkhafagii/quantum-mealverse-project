
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import Customer from '@/pages/Customer';
import DeliveryDashboard from '@/pages/delivery/DeliveryDashboard';
import RestaurantDashboard from '@/pages/restaurant/Dashboard';
import Orders from '@/pages/restaurant/Orders';
import Fitness from '@/pages/Fitness';
import Workouts from '@/pages/Workouts';
import Nutrition from '@/pages/Nutrition';
import Onboarding from '@/pages/restaurant/Onboarding';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<Customer />} />

            {/* Delivery Routes */}
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

            {/* Restaurant Routes */}
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurant/orders" element={<Orders />} />
            <Route path="/restaurant/onboarding" element={<Onboarding />} />

            {/* Fitness Routes */}
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/fitness/workouts" element={<Workouts />} />
            <Route path="/fitness/nutrition" element={<Nutrition />} />

            {/* Settings Route */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
