
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Customer page when accessing shop
    navigate('/customer');
  }, [navigate]);

  // This will not be visible as we redirect immediately
  return null;
};

export default Shop;
