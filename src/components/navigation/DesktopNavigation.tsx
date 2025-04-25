
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

interface DesktopNavigationProps {
  isCustomerView: boolean;
}

export const DesktopNavigation = ({ isCustomerView }: DesktopNavigationProps) => {
  const { isRestaurantOwner } = useRestaurantAuth();
  
  // Hide customer navigation for restaurant owners
  if (!isCustomerView || isRestaurantOwner) return null;
  
  return (
    <div className="hidden md:flex items-center space-x-2">
      <Link to="/customer" className={cn(navigationMenuTriggerStyle(), "px-4")}>
        Meals
      </Link>
      <Link to="/subscription" className={cn(navigationMenuTriggerStyle(), "px-4")}>
        Subscription
      </Link>
      <Link to="/about" className={cn(navigationMenuTriggerStyle(), "px-4")}>
        About
      </Link>
      <Link to="/contact" className={cn(navigationMenuTriggerStyle(), "px-4")}>
        Contact
      </Link>
    </div>
  );
};
