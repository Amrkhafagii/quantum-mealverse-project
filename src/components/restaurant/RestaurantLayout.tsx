
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { RestaurantNavbar } from './RestaurantNavbar';
import { Loader } from 'lucide-react';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export const RestaurantLayout: React.FC<RestaurantLayoutProps> = ({ children }) => {
  const { restaurant, loading, isRestaurantOwner } = useRestaurantAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] text-white flex items-center justify-center">
        <Loader className="h-8 w-8 text-[#1EAEDB] animate-spin" />
        <span className="ml-2 text-[#1EAEDB]">Loading restaurant dashboard...</span>
      </div>
    );
  }

  // Redirect if not a restaurant owner
  if (!isRestaurantOwner) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <RestaurantNavbar />
      <div className="container mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  );
};
