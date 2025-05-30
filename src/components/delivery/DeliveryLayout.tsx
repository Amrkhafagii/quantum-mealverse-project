
import React from 'react';
import DeliveryNavbar from './DeliveryNavbar';
import { cn } from '@/lib/utils';

interface DeliveryLayoutProps {
  children: React.ReactNode;
  deliveryUserId?: string;
  className?: string;
}

const DeliveryLayout: React.FC<DeliveryLayoutProps> = ({ 
  children, 
  deliveryUserId, 
  className = '' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <DeliveryNavbar deliveryUserId={deliveryUserId} />
      <main className={cn("delivery-content", className)}>
        {children}
      </main>
    </div>
  );
};

export default DeliveryLayout;
