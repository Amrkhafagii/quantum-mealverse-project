
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useResponsive } from "@/contexts/ResponsiveContext";
import SkipLink from "@/components/ui/a11y/skip-link";
import Index from "@/pages/Index";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import About from "@/pages/About";
import Shop from "@/pages/Shop";
import Customer from "@/pages/Customer";
import Restaurant from "@/pages/Restaurant";
import Orders from "@/pages/Orders";
import Fitness from "@/pages/Fitness";
import Nutrition from "@/pages/Nutrition";
import PageTransition from "@/components/layout/PageTransition";
import { NetworkPredictiveMonitor } from "@/components/network/NetworkPredictiveMonitor";
import ProtectedRoute from "@/components/ProtectedRoute";
import Profile from "@/pages/Profile";
import SafeAreaView from "@/components/ios/SafeAreaView";

// Restaurant routes
import RestaurantDashboard from "@/pages/restaurant/Dashboard";
import RestaurantMenu from "@/pages/restaurant/Menu";
import RestaurantOrders from "@/pages/restaurant/Orders";

// Delivery routes
import OnboardingPage from "@/pages/delivery/OnboardingPage";
import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard";
import DeliverySettings from "@/pages/delivery/DeliverySettings";

const MainLayout: React.FC = () => {
  const { isMobile, isPlatformIOS } = useResponsive();
  const location = useLocation();

  return (
    <NetworkStatusProvider>
      <NetworkPredictiveMonitor>
        <SafeAreaView className="min-h-screen flex flex-col" disableTop>
          {/* Accessibility skip link */}
          <SkipLink targetId="main-content" />
          
          <div id="main-content" className="flex-1">
            <PageTransition type="fade" className="w-full h-full">
              <Routes location={location}>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                
                {/* Customer Routes */}
                <Route path="/shop" element={<Shop />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/restaurant/:id" element={<Restaurant />} />
                
                {/* Protected Routes requiring authentication */}
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/fitness" element={<Fitness />} />
                <Route path="/nutrition" element={<Nutrition />} />
                
                {/* Restaurant Admin Routes - protected by user type */}
                <Route path="/restaurant/dashboard" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/menu" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <RestaurantMenu />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/orders" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <RestaurantOrders />
                  </ProtectedRoute>
                } />
                
                {/* Delivery Routes - protected by user type */}
                <Route path="/delivery/onboarding" element={
                  <ProtectedRoute allowedUserTypes={['delivery']}>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />
                <Route path="/delivery/dashboard" element={
                  <ProtectedRoute allowedUserTypes={['delivery']} requiresLocation={true}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/delivery/settings" element={
                  <ProtectedRoute allowedUserTypes={['delivery']}>
                    <DeliverySettings />
                  </ProtectedRoute>
                } />
              </Routes>
            </PageTransition>
          </div>
        </SafeAreaView>
      </NetworkPredictiveMonitor>
    </NetworkStatusProvider>
  );
};

export default MainLayout;
