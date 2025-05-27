
import React from 'react';
import { Link } from 'react-router-dom';

const NavbarAuthLinks: React.FC = () => {
  return (
    <>
      <Link
        to="/auth"
        className="text-blue-500 hover:text-blue-700 mr-4"
      >
        Login
      </Link>
      <Link
        to="/auth"
        state={{ mode: 'signup' }}
        className="text-green-500 hover:text-green-700"
      >
        Register
      </Link>
    </>
  );
};

export default NavbarAuthLinks;
