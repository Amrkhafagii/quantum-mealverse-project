
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

interface DesktopNavigationProps {
  isCustomerView: boolean;
}

export const DesktopNavigation = ({ isCustomerView }: DesktopNavigationProps) => {
  if (!isCustomerView) return null;
  
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
