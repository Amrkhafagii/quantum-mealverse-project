
import React from 'react';
import { Navigate } from 'react-router-dom';

const Shop = () => {
  // Use Navigate component instead of useNavigate hook in useEffect
  // This is more reliable and prevents blank pages
  return <Navigate to="/customer" replace />;
};

export default Shop;
