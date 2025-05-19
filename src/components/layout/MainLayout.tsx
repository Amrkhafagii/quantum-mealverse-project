import React from "react";
import { Routes, Route } from "react-router-dom";
import { useResponsive } from "@/contexts/ResponsiveContext";
import SkipLink from "@/components/ui/a11y/skip-link";
import Index from "@/pages/Index";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";

const MainLayout: React.FC = () => {
  const { isMobile } = useResponsive();

  return (
    <NetworkStatusProvider>
      <div className="min-h-screen flex flex-col">
        {/* Accessibility skip link */}
        <SkipLink targetId="main-content" />
        
        <div id="main-content" className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Other routes will be added here */}
          </Routes>
        </div>
      </div>
    </NetworkStatusProvider>
  );
};

export default MainLayout;
