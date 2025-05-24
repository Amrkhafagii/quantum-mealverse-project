
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { MainContent } from '@/components/customer/MainContent';
import { LocationPrompt } from '@/components/customer/LocationPrompt';
import { CustomerErrorBoundary } from '@/components/customer/CustomerErrorBoundary';
import { useCustomerState } from '@/hooks/useCustomerState';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [isMapView, setIsMapView] = useState(false);
  
  // Use centralized state management
  const {
    user,
    location,
    locationError,
    permissionStatus,
    hasRequestedPermission,
    restaurants,
    restaurantsError,
    menuItems,
    menuError,
    isLoading,
    hasError,
    errorMessage,
    requestLocation,
    clearErrors
  } = useCustomerState();

  const handleLogout = async () => {
    try {
      // Note: logout logic should be handled by auth context
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMapView = () => {
    setIsMapView(!isMapView);
  };

  const hasLocationIssue = locationError && permissionStatus !== 'granted';

  console.log('Customer page state:', {
    user: user?.email,
    location: !!location,
    restaurantsCount: restaurants?.length || 0,
    menuItemsCount: menuItems?.length || 0,
    isLoading,
    hasError,
    errorMessage,
    permissionStatus
  });

  return (
    <CustomerErrorBoundary onRetry={clearErrors}>
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-20">
          <CustomerHeader 
            userEmail={user?.email}
            onLogout={handleLogout}
          />
          
          <div className="container mx-auto px-4 py-8">
            {/* Location prompt - only show if there's an issue or permission not requested */}
            {(hasLocationIssue || !hasRequestedPermission) && (
              <LocationPrompt
                onRequestLocation={requestLocation}
                isLoading={isLoading}
                error={locationError}
                hasRequestedPermission={hasRequestedPermission}
              />
            )}
            
            <MainContent 
              isMapView={isMapView}
              menuItems={menuItems}
              isLoading={isLoading}
              error={hasError ? errorMessage : null}
              nearbyRestaurants={restaurants}
              toggleMapView={toggleMapView}
              onLocationRequest={requestLocation}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </CustomerErrorBoundary>
  );
};

export default CustomerPage;
