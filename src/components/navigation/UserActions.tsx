
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Package, CreditCard, ShoppingCart, UserRound, LogOut, User } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

interface UserActionsProps {
  isCustomerView: boolean;
  session: any;
  isAdmin: boolean;
  isRestaurant: boolean;
  itemCount: number;
  notificationCount: number;
  toggleUserView: (checked: boolean) => void;
  handleLogout: () => void;
}

export const UserActions = ({
  isCustomerView,
  session,
  isAdmin,
  isRestaurant,
  itemCount,
  toggleUserView,
  handleLogout
}: UserActionsProps) => {
  const { isRestaurantOwner } = useRestaurantAuth();

  // Don't show customer-specific actions for restaurant owners
  const showCustomerActions = !isRestaurant || (isAdmin && isCustomerView);

  return (
    <div className="flex items-center gap-4">
      {/* Only show customer features in customer view if not a restaurant or if admin */}
      {isCustomerView && showCustomerActions && (
        <>
          {session && (
            <Link to="/orders" className="relative">
              <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                <Package className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Track Orders</span>
              </Button>
            </Link>
          )}
          
          {session && (
            <NotificationPanel className="text-quantum-cyan hover:text-white" />
          )}
          
          <Link to="/checkout" className="relative hidden md:block">
            <Button variant="ghost" className="text-quantum-cyan hover:text-white">
              <CreditCard className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Checkout</span>
            </Button>
          </Link>
          
          {/* Single Cart button that displays on all screen sizes */}
          <Link to="/cart" className="relative">
            <Button variant="ghost" className="text-quantum-cyan hover:text-white">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-quantum-cyan text-quantum-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </>
      )}

      {/* Show notification panel in restaurant view */}
      {isRestaurantOwner && !isCustomerView && session && (
        <NotificationPanel className="text-[#1EAEDB] hover:text-white" />
      )}
      
      {session ? (
        <>
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 text-quantum-cyan">
              <span className="text-sm">Customer</span>
              <Switch onCheckedChange={toggleUserView} checked={!isCustomerView} />
              <span className="text-sm">Admin</span>
            </div>
          )}
          
          {!isRestaurantOwner && isCustomerView && showCustomerActions && (
            <Link to="/profile" className="hidden md:flex items-center gap-2">
              <UserRound className="h-4 w-4 text-quantum-cyan" />
              <span className="text-quantum-cyan">{session.user.email}</span>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            className="text-quantum-cyan hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </>
      ) : (
        <Link to="/auth">
          <Button variant="ghost" className="text-quantum-cyan hover:text-white">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Login</span>
          </Button>
        </Link>
      )}
    </div>
  );
};
