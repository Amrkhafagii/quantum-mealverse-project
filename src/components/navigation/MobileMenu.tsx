import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { Menu, X, User, ShoppingCart, LogOut, Home, Store, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/responsive/core/hooks';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileMenuProps {
  isOpen: boolean;
  onCloseMenu: () => void;
  user: any;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onCloseMenu, 
  user, 
  onLogout 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const isMobile = useIsMobile();
  
  const handleLogout = async () => {
    try {
      await onLogout();
      onCloseMenu();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    // Close the mobile menu when the route changes
    onCloseMenu();
  }, [location, onCloseMenu]);
  
  if (!isMobile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onCloseMenu}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate through the app.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Link to="/" className="flex items-center space-x-2 text-sm font-medium hover:underline">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link to="/shop" className="flex items-center space-x-2 text-sm font-medium hover:underline">
            <Store className="h-4 w-4" />
            <span>Shop</span>
          </Link>
          {user && (
            <>
              <Link to="/customer" className="flex items-center space-x-2 text-sm font-medium hover:underline">
                <Utensils className="h-4 w-4" />
                <span>Customer</span>
              </Link>
              <Link to="/orders" className="flex items-center space-x-2 text-sm font-medium hover:underline">
                <ShoppingCart className="h-4 w-4" />
                <span>Orders</span>
                {cart.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{cart.length}</Badge>
                )}
              </Link>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="flex items-center space-x-2 text-sm font-medium hover:underline">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="flex items-center space-x-2 text-sm font-medium hover:underline">
                <User className="h-4 w-4" />
                <span>Signup</span>
              </Link>
            </>
          )}
          {user && (
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
