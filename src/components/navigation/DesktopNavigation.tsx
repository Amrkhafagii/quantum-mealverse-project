import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Utensils, ActivitySquare, CalendarCheck, Salad, LayoutDashboard } from 'lucide-react';

interface DesktopNavigationProps {
  isCustomerView: boolean;
  isAuthenticated: boolean;
}

export const DesktopNavigation = ({ isCustomerView, isAuthenticated }: DesktopNavigationProps) => {
  const location = useLocation();
  
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isCustomerView ? (
        <>
          <Button 
            asChild 
            variant={isActive('/customer') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/customer') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/customer" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span>Order Food</span>
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive('/fitness') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/fitness') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/fitness" className="flex items-center gap-2">
              <ActivitySquare className="h-4 w-4" />
              <span>Fitness</span>
            </Link>
          </Button>

          <Button 
            asChild 
            variant={isActive('/nutrition') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/nutrition') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/nutrition" className="flex items-center gap-2">
              <Salad className="h-4 w-4" />
              <span>Nutrition</span>
            </Link>
          </Button>
        </>
      ) : (
        // Restaurant Admin navigation options
        <>
          <Button 
            asChild 
            variant={isActive('/restaurant/dashboard') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/restaurant/dashboard') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/restaurant/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive('/restaurant/menu') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/restaurant/menu') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/restaurant/menu">Menu</Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive('/restaurant/orders') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/restaurant/orders') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/restaurant/orders">Orders</Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive('/profile') ? "default" : "ghost"} 
            size="sm" 
            className={isActive('/profile') ? "bg-quantum-cyan text-quantum-black" : "text-gray-300 hover:text-white"}
          >
            <Link to="/profile">Settings</Link>
          </Button>
        </>
      )}
    </div>
  );
};
