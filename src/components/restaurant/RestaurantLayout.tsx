
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RestaurantNavbar } from './RestaurantNavbar';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export const RestaurantLayout: React.FC<RestaurantLayoutProps> = ({ children }) => {
  const { restaurant, loading, isRestaurantOwner } = useRestaurantAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not a restaurant owner
  if (!isRestaurantOwner) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <Navbar />
      <div className="container mx-auto py-16">
        <RestaurantNavbar />
        {children}
      </div>
      <Footer />
    </div>
  );
};
