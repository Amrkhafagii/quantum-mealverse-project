
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from 'lucide-react';

const NavbarAuthLinks: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <Link
        to="/login"
        className="flex items-center text-blue-500 hover:text-blue-700"
      >
        <LogIn className="h-4 w-4 mr-1" />
        Login
      </Link>
      <Link
        to="/register"
        className="flex items-center text-green-500 hover:text-green-700"
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Register
      </Link>
    </div>
  );
};

export default NavbarAuthLinks;
