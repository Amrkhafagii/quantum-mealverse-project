
import React from 'react';
import NavLinks from './NavLinks';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  user: any;
  onLogout: () => void;
  onCloseMenu: () => void;
}

const NavbarMobileMenu: React.FC<NavbarMobileMenuProps> = ({ 
  isOpen, 
  user, 
  onLogout,
  onCloseMenu
}) => {
  if (!isOpen) return null;
  
  // Provide safe fallback for user object
  const safeUser = user || {};
  
  return (
    <div className="sm:hidden" id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <NavLinks isMobile user={safeUser} closeMenu={onCloseMenu} />
        
        {!safeUser.id && (
          <>
            <a
              href="/login"
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={onCloseMenu}
            >
              Login
            </a>
            <a
              href="/register"
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={onCloseMenu}
            >
              Register
            </a>
          </>
        )}
        
        {safeUser.id && (
          <div 
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
            onClick={() => {
              onLogout();
              onCloseMenu();
            }}
          >
            Logout
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
