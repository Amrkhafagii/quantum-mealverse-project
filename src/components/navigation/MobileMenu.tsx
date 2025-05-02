
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogIn, Utensils, ActivitySquare, Dumbbell, Package, UserCog } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MobileMenuProps {
  isCustomerView: boolean;
  isAdmin: boolean;
  session: Session | null;
  toggleUserView: (checked: boolean) => void;
}

export const MobileMenu = ({ 
  isCustomerView, 
  isAdmin, 
  session,
  toggleUserView
}: MobileMenuProps) => {
  const isAuthenticated = !!session;
  
  return (
    <div className="p-4 border-t border-quantum-cyan/20 md:hidden">
      <div className="space-y-4">
        {isCustomerView ? (
          <>
            <Link 
              to="/customer" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <Utensils className="h-5 w-5 text-quantum-cyan" />
              <span>Order Food</span>
            </Link>

            <Link 
              to="/fitness" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <ActivitySquare className="h-5 w-5 text-quantum-cyan" />
              <span>Fitness</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/workouts" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
                >
                  <Dumbbell className="h-5 w-5 text-quantum-cyan" />
                  <span>Workouts</span>
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
                >
                  <UserCog className="h-5 w-5 text-quantum-cyan" />
                  <span>Profile</span>
                </Link>
                
                <Link 
                  to="/orders" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
                >
                  <Package className="h-5 w-5 text-quantum-cyan" />
                  <span>Track Orders</span>
                </Link>
              </>
            )}
            
            <Link 
              to="/cart" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
              <span>Cart</span>
            </Link>
            
            {session ? (
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <User className="h-5 w-5 text-quantum-cyan" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <LogIn className="h-5 w-5 text-quantum-cyan" />
                <span>Log In</span>
              </Link>
            )}
          </>
        ) : (
          // Admin navigation options
          <>
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/admin/menu" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <span>Menu</span>
            </Link>
            <Link 
              to="/admin/orders" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <span>Orders</span>
            </Link>
            <Link 
              to="/admin/settings" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <span>Settings</span>
            </Link>
          </>
        )}
        
        {isAdmin && (
          <div className="flex items-center space-x-2 pt-4 border-t border-quantum-cyan/20">
            <Switch 
              id="user-view-toggle" 
              checked={!isCustomerView}
              onCheckedChange={toggleUserView}
            />
            <Label htmlFor="user-view-toggle">Admin View</Label>
          </div>
        )}
      </div>
    </div>
  );
};
