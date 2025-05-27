
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from 'lucide-react';

const NavbarAuthLinks: React.FC = () => {
  return (
    <>
      <Link
        to="/auth"
        className="flex items-center text-blue-500 hover:text-blue-700 mr-4"
      >
        <LogIn className="h-4 w-4 mr-1" />
        Login
      </Link>
      <Link
        to="/auth" 
        state={{ mode: 'signup' }}
        className="flex items-center text-green-500 hover:text-green-700"
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Register
      </Link>
    </>
  );
};

export default NavbarAuthLinks;
