
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

export const RestaurantNavbar: React.FC = () => {
  const { restaurant, logout } = useRestaurantAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!restaurant) return null;

  return (
    <div className="bg-[#1A1F2C]/80 backdrop-blur-lg border-b border-[#1EAEDB]/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-lg font-semibold text-white">
            {restaurant.name}
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
            
            <Button 
              variant="ghost" 
              className="text-[#1EAEDB] hover:text-white hover:bg-[#1EAEDB]/10"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
