
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinksProps {
  isMobile?: boolean;
  user: any;
  closeMenu?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isMobile, user, closeMenu = () => {} }) => {
  const linkClasses = isMobile
    ? "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium"
    : "border-transparent text-gray-900 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  
  return (
    <>
      <Link
        to="/"
        className={isMobile ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white block px-3 py-2 rounded-md text-base font-medium" : linkClasses}
        onClick={closeMenu}
      >
        Home
      </Link>
      
      <Link
        to="/about"
        className={linkClasses}
        onClick={closeMenu}
      >
        About
      </Link>
      
      <Link
        to="/menu"
        className={linkClasses}
        onClick={closeMenu}
      >
        Menu
      </Link>
      
      <Link
        to="/contact"
        className={linkClasses}
        onClick={closeMenu}
      >
        Contact
      </Link>
      
      <Link
        to="/qr-scanner"
        className={linkClasses}
        onClick={closeMenu}
      >
        QR Scanner
      </Link>
      
      {user && (
        <Link
          to="/dashboard"
          className={linkClasses}
          onClick={closeMenu}
        >
          Dashboard
        </Link>
      )}
    </>
  );
};

export default NavLinks;
