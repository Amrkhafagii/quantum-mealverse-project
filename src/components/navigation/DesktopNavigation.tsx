
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Home, Info, MessageSquare, Utensils, ActivitySquare, Dumbbell, Package } from 'lucide-react';

interface DesktopNavigationProps {
  isCustomerView: boolean;
}

export const DesktopNavigation = ({ isCustomerView }: DesktopNavigationProps) => {
  const location = useLocation();
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isCustomerView ? (
        <>
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          
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
            <Link to="/workouts" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span>Workouts</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Track Orders</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Link to="/cart" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
            </Link>
          </Button>
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
