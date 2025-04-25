
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
    <div className="bg-gray-800 text-white p-2 mb-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div className="text-lg font-semibold px-2">{restaurant.name}</div>
        
        <div className="flex flex-wrap gap-2">
          <Link to="/restaurant/dashboard">
            <Button 
              variant={isActive('/restaurant/dashboard') ? "secondary" : "ghost"}
              size="sm"
            >
              Dashboard
            </Button>
          </Link>
          
          <Link to="/restaurant/menu">
            <Button 
              variant={isActive('/restaurant/menu') ? "secondary" : "ghost"}
              size="sm"
            >
              Menu
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
