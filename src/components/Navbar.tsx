
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useCart } from '@/contexts/CartContext';
import { useToast } from "@/hooks/use-toast";
import { MobileMenu } from './navigation/MobileMenu';
import { DesktopNavigation } from './navigation/DesktopNavigation';
import { UserActions } from './navigation/UserActions';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRestaurant, setIsRestaurant] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart?.() || { itemCount: 0 };
  const { toast } = useToast();
  const { user, logout, session } = useAuth();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    // Check admin and restaurant status when user changes
    if (user?.id) {
      checkAdminStatus(user.id);
      checkRestaurantStatus(user.id);
    } else {
      setIsAdmin(false);
      setIsRestaurant(false);
    }
  }, [user]);

  const checkAdminStatus = async (userId) => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('admin_users')
      .select()
      .eq('user_id', userId)
      .maybeSingle();
      
    setIsAdmin(!!data);
  };

  const checkRestaurantStatus = async (userId) => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('restaurants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    setIsRestaurant(!!data);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleUserView = (checked: boolean) => {
    if (checked) {
      navigate('/admin');
    } else {
      navigate('/customer');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Don't show customer navigation in restaurant paths
  const isRestaurantView = location.pathname.startsWith('/restaurant');
  const isCustomerView = !isRestaurantView && (location.pathname === '/customer' || location.pathname === '/' || 
    !['/admin', '/restaurant'].some(path => location.pathname.startsWith(path)));

  const isAuthenticated = !!session;

  // Redirect to restaurant dashboard if already on customer view and is restaurant owner
  useEffect(() => {
    if (isRestaurant && isCustomerView && isAuthenticated && !location.pathname.startsWith('/restaurant')) {
      // Only show this once when initially loading the page
      if (location.pathname === '/') {
        navigate('/restaurant/dashboard');
      }
    }
  }, [isRestaurant, isCustomerView, isAuthenticated, location.pathname]);

  // If already on a restaurant page, don't show the customer navbar
  if (isRestaurantView) return null;

  return (
    <nav className="fixed w-full z-20 top-0 bg-black/50 backdrop-blur-md border-b border-quantum-cyan/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-quantum-cyan neon-text">
            HealthAndFix
          </Link>
          
          <DesktopNavigation 
            isCustomerView={isCustomerView} 
            isAuthenticated={isAuthenticated} 
          />
          
          <div className="flex items-center gap-4">
            {isRestaurant && (
              <Button
                variant="outline"
                className="text-quantum-cyan border-quantum-cyan hover:bg-quantum-cyan/10"
                onClick={() => navigate('/restaurant/dashboard')}
              >
                Restaurant Dashboard
              </Button>
            )}
            
            <UserActions 
              isCustomerView={isCustomerView}
              session={session}
              isAdmin={isAdmin}
              itemCount={itemCount}
              notificationCount={unreadCount}
              toggleUserView={toggleUserView}
              handleLogout={handleLogout}
            />
            
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden text-quantum-cyan"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <MobileMenu 
            isCustomerView={isCustomerView}
            isAdmin={isAdmin}
            isRestaurant={isRestaurant}
            session={session}
            toggleUserView={toggleUserView}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
