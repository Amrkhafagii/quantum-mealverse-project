
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, User, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-quantum-black/80 backdrop-blur-lg border-b border-quantum-cyan/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold text-quantum-cyan neon-text animate-pulse-slow">QUANTUM<span className="text-quantum-purple">MEALS</span></span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="#meals">Meals</NavLink>
            <NavLink href="#subscription">Subscription</NavLink>
            <NavLink href="#about">About</NavLink>
            
            {/* Action Buttons */}
            <div className="flex items-center ml-8 space-x-4">
              <button className="text-quantum-cyan hover:text-quantum-purple transition-colors duration-200">
                <User className="w-5 h-5" />
              </button>
              <button className="text-quantum-cyan hover:text-quantum-purple transition-colors duration-200 relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-quantum-purple text-quantum-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </button>
              <button className="cyber-button">
                Order Now
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-quantum-cyan hover:text-quantum-purple transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 py-3 border-t border-quantum-cyan/10">
            <div className="flex flex-col space-y-3">
              <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="#meals" onClick={() => setIsMenuOpen(false)}>Meals</MobileNavLink>
              <MobileNavLink href="#subscription" onClick={() => setIsMenuOpen(false)}>Subscription</MobileNavLink>
              <MobileNavLink href="#about" onClick={() => setIsMenuOpen(false)}>About</MobileNavLink>
              
              <div className="flex items-center space-x-4 pt-2 border-t border-quantum-cyan/10">
                <button className="text-quantum-cyan hover:text-quantum-purple transition-colors duration-200">
                  <User className="w-5 h-5" />
                </button>
                <button className="text-quantum-cyan hover:text-quantum-purple transition-colors duration-200 relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 bg-quantum-purple text-quantum-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    0
                  </span>
                </button>
              </div>
              
              <button className="cyber-button mt-3 w-full">
                Order Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className }: NavLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        "text-quantum-cyan hover:text-quantum-purple transition-colors duration-200 relative group",
        className
      )}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-quantum-purple transition-all duration-300 group-hover:w-full"></span>
    </a>
  );
};

interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

const MobileNavLink = ({ href, children, onClick, className }: MobileNavLinkProps) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "text-quantum-cyan hover:text-quantum-purple transition-colors duration-200 py-2",
        className
      )}
    >
      {children}
    </a>
  );
};

export default Navbar;
