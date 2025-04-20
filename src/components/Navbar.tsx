
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { itemCount } = useCart?.() || { itemCount: 0 };
  const { toast } = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check admin status when user changes
    if (user?.id) {
      checkAdminStatus(user.id);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Subscribe to order notifications if user is logged in
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // Show toast notification when order status changes
        const newStatus = payload.new.status;
        const orderId = payload.new.id;
        
        toast({
          title: `Order Status Updated`,
          description: `Your order #${orderId.substring(0, 8)} is now ${newStatus}`,
          duration: 5000,
        });
        
        // Increment notification count
        setNotificationCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  const checkAdminStatus = async (userId) => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('admin_users')
      .select()
      .eq('user_id', userId)
      .maybeSingle();
      
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const toggleUserView = (checked: boolean) => {
    if (checked) {
      navigate('/admin');
    } else {
      navigate('/customer');
    }
  };

  const handleNotificationClick = () => {
    setNotificationCount(0);
    navigate('/orders');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isCustomerView = location.pathname === '/customer' || location.pathname === '/' || 
    !['/admin'].includes(location.pathname);

  return (
    <nav className="fixed w-full z-20 top-0 bg-black/50 backdrop-blur-md border-b border-quantum-cyan/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-quantum-cyan neon-text">
            ZenithMeals
          </Link>
          
          <DesktopNavigation isCustomerView={isCustomerView} />
          
          <div className="flex items-center gap-4">
            <UserActions 
              isCustomerView={isCustomerView}
              session={user ? { user } : null}
              isAdmin={isAdmin}
              itemCount={itemCount}
              notificationCount={notificationCount}
              toggleUserView={toggleUserView}
              handleNotificationClick={handleNotificationClick}
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
            session={user ? { user } : null}
            toggleUserView={toggleUserView}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
