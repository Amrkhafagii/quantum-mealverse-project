
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogIn, Utensils, ActivitySquare, Package, ChefHat, Truck } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { Platform } from '@/utils/platform';

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
  const isMobile = useIsMobile();
  
  const user = session?.user;
  const userType = user?.user_metadata?.user_type;
  const isDeliveryUser = userType === 'delivery';
  
  // Don't show customer options for restaurant users unless they're an admin in customer view
  const showCustomerOptions = !isRestaurant || (isAdmin && isCustomerView);
  
  // Apply touch-friendly styling conditionally
  const linkClasses = isMobile 
    ? "flex items-center space-x-2 p-4 rounded-lg hover:bg-quantum-darkBlue/50 active:bg-quantum-darkBlue/70 touch-feedback" 
    : "flex items-center space-x-2 p-2 rounded-lg hover:bg-quantum-darkBlue/50";
  
  return (
    <div className={`p-4 pb-safe border-t border-quantum-cyan/20 md:hidden`}>
      <div className="space-y-2">
        {isDeliveryUser ? (
          // Delivery user navigation
          <>
            <Link 
              to="/delivery/dashboard" 
              className={linkClasses}
            >
              <Truck className="h-5 w-5 text-quantum-cyan" />
              <span>Delivery Dashboard</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={linkClasses}
            >
              <User className="h-5 w-5 text-quantum-cyan" />
              <span>Profile</span>
            </Link>
          </>
        ) : isCustomerView && showCustomerOptions ? (
          // Customer navigation
          <>
            <Link 
              to="/customer" 
              className={linkClasses}
            >
              <Utensils className="h-5 w-5 text-quantum-cyan" />
              <span>Order Food</span>
            </Link>

            {!isDeliveryUser && (
              <Link 
                to="/fitness" 
                className={linkClasses}
              >
                <ActivitySquare className="h-5 w-5 text-quantum-cyan" />
                <span>Fitness</span>
              </Link>
            )}
            
            {isAuthenticated && !isDeliveryUser && (
              <Link 
                to="/orders" 
                className={linkClasses}
              >
                <Package className="h-5 w-5 text-quantum-cyan" />
                <span>Track Orders</span>
              </Link>
            )}
            
            {!isDeliveryUser && (
              <Link 
                to="/cart" 
                className={linkClasses}
              >
                <ShoppingCart className="h-5 w-5 text-quantum-cyan" />
                <span>Cart</span>
              </Link>
            )}
            
            {session ? (
              <Link 
                to="/auth" 
                className={linkClasses}
              >
                <User className="h-5 w-5 text-quantum-cyan" />
                <span>Account</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  className={linkClasses}
                >
                  <LogIn className="h-5 w-5 text-quantum-cyan" />
                  <span>Log In</span>
                </Link>
                
                <Link 
                  to="/auth" 
                  state={{ mode: 'signup' }}
                  className={`${linkClasses} bg-quantum-darkBlue/30 border border-quantum-cyan/20`}
                >
                  <Truck className="h-5 w-5 text-quantum-cyan" />
                  <span>Become a Delivery Partner</span>
                </Link>
              </>
            )}

            {isRestaurant && (
              <div className="pt-4 border-t border-quantum-cyan/20">
                <Button
                  variant="outline"
                  className="w-full h-12 text-quantum-cyan border-quantum-cyan hover:bg-quantum-cyan/10 flex items-center gap-2 touch-feedback"
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
              className={linkClasses}
            >
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/admin/menu" 
              className={linkClasses}
            >
              <span>Menu</span>
            </Link>
            <Link 
              to="/admin/orders" 
              className={linkClasses}
            >
              <span>Orders</span>
            </Link>
            <Link 
              to="/admin/settings" 
              className={linkClasses}
            >
              <span>Settings</span>
            </Link>
          </>
        )}
        
        {isAdmin && !isDeliveryUser && (
          <div className="flex items-center space-x-2 pt-4 border-t border-quantum-cyan/20">
            <Switch 
              id="user-view-toggle" 
              checked={!isCustomerView}
              onCheckedChange={toggleUserView}
              className="data-[state=checked]:bg-quantum-purple"
            />
            <Label htmlFor="user-view-toggle" className="cursor-pointer">Admin View</Label>
          </div>
        )}
      </div>
    </div>
  );
};
