
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, UserRound, ShoppingCart, Menu, X, CreditCard, Package, Bell } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from '@/contexts/CartContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { itemCount } = useCart?.() || { itemCount: 0 };
  const { toast } = useToast();

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to order notifications if user is logged in
  React.useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${session.user.id}`,
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
  }, [session?.user?.id, toast]);

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
    await supabase.auth.signOut();
    navigate('/auth');
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

  const handleNotificationClick = () => {
    // Reset notification count and navigate to orders page
    setNotificationCount(0);
    navigate('/orders');
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {isCustomerView && (
              <div className="flex items-center space-x-2">
                <Link to="/customer" className={cn(navigationMenuTriggerStyle(), "px-4")}>
                  Meals
                </Link>
                <Link to="/subscription" className={cn(navigationMenuTriggerStyle(), "px-4")}>
                  Subscription
                </Link>
                <Link to="/about" className={cn(navigationMenuTriggerStyle(), "px-4")}>
                  About
                </Link>
                <Link to="/contact" className={cn(navigationMenuTriggerStyle(), "px-4")}>
                  Contact
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isCustomerView && (
              <>
                {session && (
                  <Link to="/orders" className="relative">
                    <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                      <Package className="h-5 w-5" />
                      <span className="ml-2 hidden md:inline">Track Orders</span>
                    </Button>
                  </Link>
                )}
                
                {session && (
                  <Button 
                    variant="ghost" 
                    className="text-quantum-cyan hover:text-white relative"
                    onClick={handleNotificationClick}
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                )}
                
                <Link to="/checkout" className="relative">
                  <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                    <CreditCard className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">Checkout</span>
                  </Button>
                </Link>
                <Link to="/cart" className="relative">
                  <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-quantum-cyan text-quantum-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}
            
            {session ? (
              <>
                {isAdmin && (
                  <div className="hidden md:flex items-center gap-2 text-quantum-cyan">
                    <span className="text-sm">Customer</span>
                    <Switch onCheckedChange={toggleUserView} checked={!isCustomerView} />
                    <span className="text-sm">Admin</span>
                  </div>
                )}
                
                <Link to="/profile" className="hidden md:flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-quantum-cyan" />
                  <span className="text-quantum-cyan">{session.user.email}</span>
                </Link>
                
                <Button 
                  variant="ghost" 
                  className="text-quantum-cyan hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" className="text-quantum-cyan hover:text-white">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
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
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;
