
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, UserRound, ShoppingCart, Menu, X, Home } from 'lucide-react';
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart?.() || { itemCount: 0 };

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

  const isCustomerView = location.pathname === '/customer' || location.pathname === '/';

  return (
    <nav className="fixed w-full z-20 top-0 bg-black/50 backdrop-blur-md border-b border-quantum-cyan/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-quantum-cyan neon-text">
            Quantum Eats
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {isCustomerView && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/customer">
                      <div className={navigationMenuTriggerStyle()}>
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </div>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/shop">
                      <div className={navigationMenuTriggerStyle()}>Shop</div>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/subscription">
                      <div className={navigationMenuTriggerStyle()}>Subscription</div>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/about">
                      <div className={navigationMenuTriggerStyle()}>About</div>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/contact">
                      <div className={navigationMenuTriggerStyle()}>Contact</div>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isCustomerView && (
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
                <div className="hidden md:flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-quantum-cyan" />
                  <span className="text-quantum-cyan">{session.user.email}</span>
                </div>
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                    className="text-quantum-cyan hover:text-white flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <Link 
                    to="/shop" 
                    className="text-quantum-cyan hover:text-white" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link 
                    to="/subscription" 
                    className="text-quantum-cyan hover:text-white" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-quantum-cyan hover:text-white" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-quantum-cyan hover:text-white" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
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
