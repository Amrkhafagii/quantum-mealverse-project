
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
import PageTransition from "@/components/layout/PageTransition";
import { NetworkPredictiveMonitor } from "@/components/network/NetworkPredictiveMonitor";

// Restaurant routes
import RestaurantDashboard from "@/pages/restaurant/Dashboard";
import RestaurantMenu from "@/pages/restaurant/Menu";
import RestaurantOrders from "@/pages/restaurant/Orders";

// Delivery routes
import OnboardingPage from "@/pages/delivery/OnboardingPage";
import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard";
import DeliverySettings from "@/pages/delivery/DeliverySettings";

const MainLayout: React.FC = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();

  return (
    <NetworkStatusProvider>
      <NetworkPredictiveMonitor>
        <div className="min-h-screen flex flex-col">
          {/* Accessibility skip link */}
          <SkipLink targetId="main-content" />
          
          <div id="main-content" className="flex-1">
            <PageTransition type="fade" identifier={location.pathname} className="w-full h-full">
              <Routes location={location}>
                {/* Main Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/restaurant/:id" element={<Restaurant />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/fitness" element={<Fitness />} />
                
                {/* Restaurant Admin Routes */}
                <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
                <Route path="/restaurant/menu" element={<RestaurantMenu />} />
                <Route path="/restaurant/orders" element={<RestaurantOrders />} />
                
                {/* Delivery Routes */}
                <Route path="/delivery/onboarding" element={<OnboardingPage />} />
                <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                <Route path="/delivery/settings" element={<DeliverySettings />} />
              </Routes>
            </PageTransition>
          </div>
        </div>
      </NetworkPredictiveMonitor>
    </NetworkStatusProvider>
  );
};

export default MainLayout;
