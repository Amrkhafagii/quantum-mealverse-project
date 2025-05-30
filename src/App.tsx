import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import DeliveryDashboard from '@/pages/delivery/DeliveryDashboard';
import RestaurantDashboard from '@/pages/restaurant/Dashboard';
import Orders from '@/pages/restaurant/Orders';
import FitnessDashboard from '@/pages/fitness/FitnessDashboard';
import WorkoutSchedulerPage from '@/pages/fitness/WorkoutSchedulerPage';
import ExerciseLibraryPage from '@/pages/fitness/ExerciseLibraryPage';
import Food from '@/pages/Food';
import RestaurantOnboardingPage from '@/pages/restaurant/RestaurantOnboardingPage';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/food" element={<Food />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerDashboard />} />

          {/* Delivery Routes */}
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

          {/* Restaurant Routes */}
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant/orders" element={<Orders />} />
          <Route path="/restaurant/onboarding" element={<RestaurantOnboardingPage />} />

          {/* Fitness Routes */}
          <Route path="/fitness" element={<FitnessDashboard />} />
          <Route path="/fitness/workout-scheduler" element={<WorkoutSchedulerPage />} />
          <Route path="/fitness/exercise-library" element={<ExerciseLibraryPage />} />

          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
