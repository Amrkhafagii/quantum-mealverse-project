
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface NavbarCartProps {
  cartCount: number;
}

const NavbarCart: React.FC<NavbarCartProps> = ({ cartCount }) => {
  return (
    <Link to="/cart" className="mr-4 relative">
      <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      {cartCount > 0 && (
        <span className="absolute top-[-6px] right-[-6px] bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {cartCount}
        </span>
      )}
    </Link>
  );
};

export default NavbarCart;
