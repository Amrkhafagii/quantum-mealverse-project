
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogIn, Utensils, ActivitySquare, Package, ChefHat, Truck } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isCustomerView: boolean;
  isAdmin: boolean;
  isRestaurant?: boolean;
  session: Session | null;
  toggleUserView: (checked: boolean) => void;
}

export const MobileMenu = ({ 
  isCustomerView, 
  isAdmin, 
  isRestaurant = false,
  session,
  toggleUserView
}: MobileMenuProps) => {
  const isAuthenticated = !!session;
  const navigate = useNavigate();
  
  const user = session?.user;
  const userType = user?.user_metadata?.user_type;
  const isDeliveryUser = userType === 'delivery';
  
  // Don't show customer options for restaurant users unless they're an admin in customer view
  const showCustomerOptions = !isRestaurant || (isAdmin && isCustomerView);
  
  return (
    <div className="p-4 border-t border-quantum-cyan/20 md:hidden">
      <div className="space-y-4">
        {isCustomerView && showCustomerOptions ? (
          <>
            <Link 
              to="/customer" 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
            >
              <Utensils className="h-5 w-5 text-quantum-cyan" />
              <span>Order Food</span>
            </Link>

            {!isDeliveryUser && (
              <Link 
                to="/fitness" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <ActivitySquare className="h-5 w-5 text-quantum-cyan" />
                <span>Fitness</span>
              </Link>
            )}
            
            {isAuthenticated && !isDeliveryUser && (
              <Link 
                to="/orders" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <Package className="h-5 w-5 text-quantum-cyan" />
                <span>Track Orders</span>
              </Link>
            )}
            
            {isAuthenticated && isDeliveryUser && (
              <Link 
                to="/delivery/dashboard" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <Truck className="h-5 w-5 text-quantum-cyan" />
                <span>Delivery Dashboard</span>
              </Link>
            )}
            
            {!isDeliveryUser && (
              <Link 
                to="/cart" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
                <span>Cart</span>
              </Link>
            )}
            
            {session ? (
              <Link 
                to="/auth" 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
              >
                <User className="h-5 w-5 text-quantum-cyan" />
                <span>Account</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50"
                >
                  <LogIn className="h-5 w-5 text-quantum-cyan" />
                  <span>Log In</span>
                </Link>
                
                <Link 
                  to="/auth" 
                  state={{ mode: 'signup' }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50 bg-quantum-darkBlue/30 border border-quantum-cyan/20"
                >
                  <Truck className="h-5 w-5 text-quantum-cyan" />
                  <span>Become a Delivery Partner</span>
                </Link>
              </>
            )}

            {isRestaurant && (
              <div className="pt-2 border-t border-quantum-cyan/20">
                <Button
                  variant="outline"
                  className="w-full text-quantum-cyan border-quantum-cyan hover:bg-quantum-cyan/10 flex items-center gap-2"
                  onClick={() => navigate('/restaurant/dashboard')}
                >
                  <ChefHat className="h-5 w-5" />
                  <span>Restaurant Dashboard</span>
                </Button>
              </div>
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
