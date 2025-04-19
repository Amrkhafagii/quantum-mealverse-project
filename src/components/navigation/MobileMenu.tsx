
import React from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Switch } from 'lucide-react';

interface MobileMenuProps {
  isCustomerView: boolean;
  isAdmin: boolean;
  session: any;
  toggleUserView: (checked: boolean) => void;
}

export const MobileMenu = ({ 
  isCustomerView, 
  isAdmin, 
  session, 
  toggleUserView 
}: MobileMenuProps) => {
  return (
    <div className="md:hidden bg-black/80 backdrop-blur-lg p-4 rounded-b-lg border border-quantum-cyan/20 border-t-0">
      <div className="flex flex-col space-y-4">
        {isCustomerView && (
          <>
            <Link 
              to="/customer" 
              className="text-quantum-cyan hover:text-white"
            >
              Meals
            </Link>
            <Link 
              to="/subscription" 
              className="text-quantum-cyan hover:text-white"
            >
              Subscription
            </Link>
            <Link 
              to="/about" 
              className="text-quantum-cyan hover:text-white"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-quantum-cyan hover:text-white"
            >
              Contact
            </Link>
            {session && (
              <Link 
                to="/orders" 
                className="text-quantum-cyan hover:text-white"
              >
                Track Orders
              </Link>
            )}
            <Link 
              to="/checkout" 
              className="text-quantum-cyan hover:text-white"
            >
              Checkout
            </Link>
            {session && (
              <Link 
                to="/profile" 
                className="text-quantum-cyan hover:text-white"
              >
                Profile
              </Link>
            )}
          </>
        )}
        
        {isAdmin && (
          <div className="flex items-center gap-2 text-quantum-cyan pt-2 border-t border-quantum-cyan/20">
            <span className="text-sm">Customer</span>
            <Switch onCheckedChange={toggleUserView} checked={!isCustomerView} />
            <span className="text-sm">Admin</span>
          </div>
        )}
        
        {session && (
          <div className="flex items-center gap-2 text-quantum-cyan">
            <UserRound className="h-4 w-4" />
            <span className="text-sm truncate max-w-[200px]">{session.user.email}</span>
          </div>
        )}
      </div>
    </div>
  );
};
