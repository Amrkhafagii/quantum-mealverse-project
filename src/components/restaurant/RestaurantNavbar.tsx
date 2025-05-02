
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { LoadingButton } from "@/components/ui/loading-button";

export const RestaurantNavbar: React.FC = () => {
  const { restaurant, logout } = useRestaurantAuth();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Show loading state
      setIsLoggingOut(true);
      
      // Call the logout function from the auth hook
      // The hook now handles navigation to /auth
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  if (!restaurant) return null;

  return (
    <div className="bg-[#1A1F2C]/80 backdrop-blur-lg border-b border-[#1EAEDB]/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-lg font-semibold text-white">
            {restaurant.name} <span className="text-sm text-[#1EAEDB]">(Restaurant Dashboard)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/restaurant/dashboard">
              <Button 
                variant={isActive('/restaurant/dashboard') ? "secondary" : "ghost"}
                className={`${isActive('/restaurant/dashboard') ? 'bg-[#9b87f5] text-white hover:bg-[#9b87f5]/90' : 'text-[#1EAEDB] hover:text-white hover:bg-[#1EAEDB]/10'}`}
              >
                Dashboard
              </Button>
            </Link>
            
            <Link to="/restaurant/menu">
              <Button 
                variant={isActive('/restaurant/menu') ? "secondary" : "ghost"}
                className={`${isActive('/restaurant/menu') ? 'bg-[#9b87f5] text-white hover:bg-[#9b87f5]/90' : 'text-[#1EAEDB] hover:text-white hover:bg-[#1EAEDB]/10'}`}
              >
                Menu
              </Button>
            </Link>
            
            <NotificationPanel className="text-[#1EAEDB] hover:text-white hover:bg-[#1EAEDB]/10" />
            
            <LoadingButton 
              variant="ghost" 
              loading={isLoggingOut}
              onClick={handleLogout}
              className="text-[#1EAEDB] hover:text-white hover:bg-[#1EAEDB]/10"
            >
              Logout
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};
