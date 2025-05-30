
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useResponsive } from "@/contexts/ResponsiveContext";
import SkipLink from "@/components/ui/a11y/skip-link";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
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
import { PlatformContainer } from "@/components/layout/PlatformContainer";

// Restaurant routes
import RestaurantDashboard from "@/pages/restaurant/Dashboard";
import RestaurantMenu from "@/pages/restaurant/Menu";
import RestaurantOrders from "@/pages/restaurant/Orders";

// Delivery routes
import OnboardingPage from "@/pages/delivery/OnboardingPage";
import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard";
import DeliverySettings from "@/pages/delivery/DeliverySettings";

const MainLayout: React.FC = () => {
  const { isMobile, isPlatformIOS, isTablet, isInitialized } = useResponsive();
  const location = useLocation();

  // Show loading state until responsive context is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NetworkStatusProvider>
      <NetworkPredictiveMonitor>
        <PlatformContainer 
          variant="default" 
          padding="none" 
          maxWidth="none" 
          fullHeight={true}
          safeArea={isPlatformIOS}
          className="responsive-container"
        >
          {/* Enhanced accessibility skip link - mobile-first */}
          <SkipLink 
            targetId="main-content" 
            className="skip-link-responsive"
          />
          
          <div 
            id="main-content" 
            className="flex-1 w-full responsive-main-content"
            role="main"
            aria-label="Main application content"
          >
            <PageTransition 
              type={isMobile ? "fade" : "platform"} 
              className="w-full h-full responsive-transition"
            >
              <Routes location={location}>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/shop" element={<Shop />} />
                
                {/* Customer Route - now protected */}
                <Route path="/customer" element={
                  <ProtectedRoute>
                    <Customer />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/:id" element={<Restaurant />} />
                
                {/* Protected Routes requiring authentication */}
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:orderId" element={
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
        </PlatformContainer>
      </NetworkPredictiveMonitor>
    </NetworkStatusProvider>
  );
};

export default MainLayout;
