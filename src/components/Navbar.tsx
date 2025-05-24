import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';
import SafeAreaView from '@/components/ios/SafeAreaView';

// Import the refactored components
import NavLinks from './navbar/NavLinks';
import NavbarUser from './navbar/NavbarUser';
import NavbarMobileMenu from './navbar/NavbarMobileMenu';
import NavbarCart from './navbar/NavbarCart';
import NavbarThemeToggle from './navbar/NavbarThemeToggle';
import NavbarAuthLinks from './navbar/NavbarAuthLinks';

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
  const { 
    isMobile, 
    isTablet, 
    isPlatformIOS, 
    statusBarHeight,
    safeAreaTop, 
    hasNotch,
    hasDynamicIsland
  } = useResponsive();
  
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
  
  // We use SafeAreaView instead of manual styling now
  return (
    <SafeAreaView 
      as="nav"
      className="bg-white shadow-sm dark:bg-gray-800 sticky top-0 z-50"
      disableSides
      disableBottom
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Quantum Mealverse
              </Link>
            </div>
          </div>
          
          {!isMobile && (
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLinks user={user} />
            </div>
          )}
          
          <div className="flex items-center">
            <NavbarCart cartCount={cart.length} />
            
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
    </SafeAreaView>
  );
};

export default Navbar;
