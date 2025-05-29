
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDriverAvailability } from '@/hooks/useDriverAvailability';
import { Menu, X, Truck, DollarSign, MapPin, Settings, LogOut, User, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useResponsive } from '@/contexts/ResponsiveContext';
import SafeAreaView from '@/components/ios/SafeAreaView';

interface DeliveryNavbarProps {
  deliveryUserId?: string;
}

const DeliveryNavbar: React.FC<DeliveryNavbarProps> = ({ deliveryUserId }) => {
  const { user, logout } = useAuth();
  const { isMobile } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock availability state - in real app this would come from the hook
  const [isAvailable, setIsAvailable] = useState(false);

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

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In real app, this would call the availability service
    console.log('Driver availability toggled:', !isAvailable);
  };

  const navItems = [
    { to: "/delivery/dashboard", icon: Truck, label: "Dashboard" },
    { to: "/delivery/earnings", icon: DollarSign, label: "Earnings" },
    { to: "/delivery/settings", icon: Settings, label: "Settings" },
    { to: "/delivery/support", icon: HelpCircle, label: "Support" },
  ];

  return (
    <SafeAreaView 
      as="nav"
      className="bg-orange-50 border-b border-orange-200 sticky top-0 z-50"
      disableSides
      disableBottom
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/delivery/dashboard" className="text-xl font-bold text-orange-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-orange-600" />
                Driver Hub
              </Link>
            </div>
          </div>
          
          {!isMobile && (
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-orange-700 hover:text-orange-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {/* Driver Availability Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-700">
                {isAvailable ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
                className="data-[state=checked]:bg-green-500"
              />
              <Badge 
                variant={isAvailable ? "default" : "secondary"}
                className={isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
              >
                {isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            {isMobile && (
              <Button
                variant="ghost"
                className="ml-2 p-2 text-orange-700 hover:text-orange-900"
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
            
            {!isMobile && user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-orange-700">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-orange-700 hover:text-orange-900 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-orange-50 border-t border-orange-200">
          <div className="px-4 py-3 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-orange-700 hover:text-orange-900 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3"
                onClick={closeMobileMenu}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            
            {user && (
              <div className="border-t border-orange-200 pt-3 mt-3">
                <div className="flex items-center gap-2 px-3 py-2 text-orange-700">
                  <User className="h-5 w-5" />
                  <span className="text-base">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-orange-700 hover:text-orange-900 flex items-center gap-3 px-3 py-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </SafeAreaView>
  );
};

export default DeliveryNavbar;
