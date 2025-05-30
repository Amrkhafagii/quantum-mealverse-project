
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinksProps {
  isMobile?: boolean;
  user: any;
  closeMenu?: () => void;
}

const getNavLinkClasses = (isMobile: boolean, isActive?: boolean) => {
  const baseClasses = isMobile
    ? "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium"
    : "border-transparent text-gray-900 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  
  return isActive ? `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white` : baseClasses;
};

const NavLinks: React.FC<NavLinksProps> = ({ isMobile = false, user, closeMenu = () => {} }) => {
  // Provide fallback for user object to prevent crashes
  const safeUser = user || {};
  
  return (
    <>
      <Link
        to="/"
        className={getNavLinkClasses(isMobile, true)}
        onClick={closeMenu}
      >
        Home
      </Link>
      
      <Link
        to="/about"
        className={getNavLinkClasses(isMobile)}
        onClick={closeMenu}
      >
        About
      </Link>
      
      <Link
        to="/customer"
        className={getNavLinkClasses(isMobile)}
        onClick={closeMenu}
      >
        Order Food
      </Link>
      
      <Link
        to="/fitness"
        className={getNavLinkClasses(isMobile)}
        onClick={closeMenu}
      >
        Fitness
      </Link>
      
      <Link
        to="/nutrition"
        className={getNavLinkClasses(isMobile)}
        onClick={closeMenu}
      >
        Nutrition
      </Link>
      
      <Link
        to="/orders"
        className={getNavLinkClasses(isMobile)}
        onClick={closeMenu}
      >
        My Orders
      </Link>
      
      {safeUser && (
        <>
          <Link
            to="/dashboard"
            className={getNavLinkClasses(isMobile)}
            onClick={closeMenu}
          >
            Dashboard
          </Link>
          
          {safeUser.isRestaurantOwner && (
            <Link
              to="/restaurant/dashboard"
              className={getNavLinkClasses(isMobile)}
              onClick={closeMenu}
            >
              Restaurant
            </Link>
          )}
          
          {safeUser.isDeliveryDriver && (
            <Link
              to="/delivery/dashboard"
              className={getNavLinkClasses(isMobile)}
              onClick={closeMenu}
            >
              Delivery
            </Link>
          )}
        </>
      )}
    </>
  );
};

export default NavLinks;
