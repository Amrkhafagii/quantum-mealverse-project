
import React, { ReactNode } from 'react';
import { RestaurantNavbar } from './RestaurantNavbar';
import { ConnectionStateIndicator } from '@/components/ui/ConnectionStateIndicator';

interface RestaurantLayoutProps {
  children: ReactNode;
}

export const RestaurantLayout: React.FC<RestaurantLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <RestaurantNavbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Restaurant Dashboard</h1>
          <ConnectionStateIndicator showText={true} />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
