
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useResponsive } from '@/contexts/ResponsiveContext';
import NavbarAuthLinks from './NavbarAuthLinks';
import { Badge } from '@/components/ui/badge';

// Import the refactored components
import NavLinks from './navbar/NavLinks';
import NavbarUser from './navbar/NavbarUser';
import NavbarMobileMenu from './navbar/NavbarMobileMenu';
import NavbarCart from './navbar/NavbarCart';
import NavbarThemeToggle from './navbar/NavbarThemeToggle';

interface NavbarProps {
  toggleDarkMode?: () => void;
  isDarkMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  toggleDarkMode = () => {}, 
  isDarkMode = false 
}) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { isMobile, isTablet } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                HealthAndFix
              </Link>
            </div>
          </div>
          
          {!isMobile && (
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLinks user={user} />
            </div>
          )}
          
          <div className="flex items-center">
            <Link to="/cart" className="mr-4 relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {cart.length}
                </Badge>
              )}
            </Link>
            
            <NavbarThemeToggle />
            
            {isMobile && (
              <Button
                variant="ghost"
                className="ml-2 p-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
            
            {!isMobile && user ? (
              <NavbarUser user={user} onLogout={handleLogout} />
            ) : !isMobile && (
              <NavbarAuthLinks />
            )}
          </div>
        </div>
      </div>
      
      <NavbarMobileMenu 
        isOpen={isMobile && mobileMenuOpen}
        user={user}
        onLogout={handleLogout}
        onCloseMenu={closeMobileMenu}
      />
    </nav>
  );
};

export default Navbar;
