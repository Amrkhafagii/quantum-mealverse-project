
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
  itemCount: number;
  notificationCount: number;
  toggleUserView: (checked: boolean) => void;
  handleLogout: () => void;
}

export const UserActions = ({
  isCustomerView,
  session,
  isAdmin,
  itemCount,
  toggleUserView,
  handleLogout
}: UserActionsProps) => {
  const { isRestaurantOwner } = useRestaurantAuth();

  // If user is a restaurant owner, only show logout button in customer view
  if (isRestaurantOwner && isCustomerView) {
    return (
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="text-quantum-cyan hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Only show customer features if not a restaurant owner */}
      {isCustomerView && !isRestaurantOwner && (
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
          
          <Link to="/checkout" className="relative">
            <Button variant="ghost" className="text-quantum-cyan hover:text-white">
              <CreditCard className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Checkout</span>
            </Button>
          </Link>
          
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

      {/* Show notification panel in restaurant view too */}
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
          
          {!isRestaurantOwner && (
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
