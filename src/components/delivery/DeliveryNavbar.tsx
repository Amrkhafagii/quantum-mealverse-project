import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  MapPin,
  Bell,
  Shield
} from 'lucide-react';
import { useResponsive } from '@/responsive/core';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeliveryNavbarProps {
  toggleMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

const DeliveryNavbar: React.FC<DeliveryNavbarProps> = ({ toggleMobileMenu, mobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Delivery App
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/delivery/dashboard" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/delivery/settings" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Settings
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <User className="h-4 w-4" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/delivery/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isMobile && (
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNavbar;
