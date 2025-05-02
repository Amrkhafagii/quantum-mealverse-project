
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
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isCustomerView ? (
        <>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/customer" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span>Order Food</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/fitness" className="flex items-center gap-2">
              <ActivitySquare className="h-4 w-4" />
              <span>Fitness</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/nutrition" className="flex items-center gap-2">
              <Salad className="h-4 w-4" />
              <span>Nutrition</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/subscription" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span>Meal Plans</span>
            </Link>
          </Button>
        </>
      ) : (
        // Restaurant Admin navigation options
        <>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/restaurant/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/restaurant/menu">Menu</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/restaurant/orders">Orders</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/profile">Settings</Link>
          </Button>
        </>
      )}
    </div>
  );
};
