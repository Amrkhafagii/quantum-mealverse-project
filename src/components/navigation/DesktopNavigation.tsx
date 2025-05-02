
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Utensils, ActivitySquare, Dumbbell, UserCog } from 'lucide-react';

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
          
          {isAuthenticated && (
            <>
              <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Link to="/workouts" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  <span>Workouts</span>
                </Link>
              </Button>
              
              <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Link to="/profile" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </Button>
            </>
          )}
          
          {/* Removed Cart button from here as it's already in UserActions */}
        </>
      ) : (
        // Admin navigation options
        <>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/admin">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/admin/menu">Menu</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/admin/orders">Orders</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/admin/settings">Settings</Link>
          </Button>
        </>
      )}
    </div>
  );
};
