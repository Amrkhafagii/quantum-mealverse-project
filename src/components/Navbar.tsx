
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSelector from './LanguageSelector';
import LocationStatusIndicator from './location/LocationStatusIndicator';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items } = useCart();
  const { t } = useLanguage();

  const itemCount = items.reduce((total, item) => total + (item.quantity || 1), 0);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-quantum-black/70 backdrop-blur-md fixed w-full z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-quantum-cyan neon-text">
              Quantum<span className="text-quantum-purple">Fit</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-2 items-center">
            <Link to="/" className="px-3 py-2 text-white hover:text-quantum-cyan transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/customer" className="px-3 py-2 text-white hover:text-quantum-cyan transition-colors">
              {t('nav.menu')}
            </Link>
            <Link to="/subscription" className="px-3 py-2 text-white hover:text-quantum-cyan transition-colors">
              Plans
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 text-white hover:text-quantum-cyan transition-colors">
                  Dashboard
                </Link>
                
                {/* Location status indicator */}
                <LocationStatusIndicator />
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="Cart"
                  onClick={() => navigate('/cart')} 
                  className="relative mr-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-quantum-cyan text-quantum-black">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
                
                <LanguageSelector variant="minimal" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      aria-label="User menu"
                      className="rounded-full"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="mt-2 bg-quantum-darkBlue/90 border-quantum-cyan/30 backdrop-blur-sm">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-quantum-cyan/20" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <LanguageSelector variant="minimal" />
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-quantum-cyan transition-colors"
                >
                  {t('nav.login')}
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                >
                  {t('nav.signup')}
                </Button>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              <>
                {/* Mobile location indicator */}
                <LocationStatusIndicator colorVariant="navbar" />
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="Cart"
                  onClick={() => navigate('/cart')} 
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-quantum-cyan text-quantum-black">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </>
            )}
            
            <button 
              onClick={toggleMenu} 
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-quantum-black/95 backdrop-blur-md z-50 min-h-[50vh] p-4 border-t border-quantum-cyan/20 space-y-4">
          <Link to="/" className="block px-3 py-2 text-white hover:text-quantum-cyan transition-colors" onClick={toggleMenu}>
            {t('nav.home')}
          </Link>
          <Link to="/customer" className="block px-3 py-2 text-white hover:text-quantum-cyan transition-colors" onClick={toggleMenu}>
            {t('nav.menu')}
          </Link>
          <Link to="/subscription" className="block px-3 py-2 text-white hover:text-quantum-cyan transition-colors" onClick={toggleMenu}>
            Plans
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 text-white hover:text-quantum-cyan transition-colors" onClick={toggleMenu}>
                Dashboard
              </Link>
              <Link to="/profile" className="block px-3 py-2 text-white hover:text-quantum-cyan transition-colors" onClick={toggleMenu}>
                {t('nav.profile')}
              </Link>
              <div className="flex items-center mt-4">
                <LanguageSelector />
              </div>
              <Button 
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                variant="destructive"
                className="w-full mt-4"
              >
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center mt-4">
                <LanguageSelector />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/login');
                    toggleMenu();
                  }}
                  className="w-full border-quantum-cyan text-white"
                >
                  {t('nav.login')}
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/signup');
                    toggleMenu();
                  }}
                  className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                >
                  {t('nav.signup')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
