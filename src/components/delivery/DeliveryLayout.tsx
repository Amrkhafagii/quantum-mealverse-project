
import React, { useState } from 'react';
import DeliveryNavbar from './DeliveryNavbar';
import { cn } from '@/lib/utils';

interface DeliveryLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DeliveryLayout: React.FC<DeliveryLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <DeliveryNavbar 
        toggleMobileMenu={toggleMobileMenu}
        mobileMenuOpen={mobileMenuOpen}
      />
      <main className={cn("delivery-content", className)}>
        {children}
      </main>
    </div>
  );
};

export default DeliveryLayout;
