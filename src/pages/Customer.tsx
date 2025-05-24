
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { MainContent } from '@/components/customer/MainContent';
import { LocationPrompt } from '@/components/customer/LocationPrompt';
import { CustomerErrorBoundary } from '@/components/customer/CustomerErrorBoundary';
import { CustomerBreadcrumbs } from '@/components/customer/CustomerBreadcrumbs';
import { CustomerNavigation } from '@/components/customer/CustomerNavigation';
import { CustomerJourneyGuide } from '@/components/customer/CustomerJourneyGuide';
import { useCustomerState } from '@/hooks/useCustomerState';
import { useCart } from '@/contexts/CartContext';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [isMapView, setIsMapView] = useState(false);
  const { cart } = useCart();
  
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
  const hasLocation = !!location && permissionStatus === 'granted';
  const hasRestaurants = restaurants && restaurants.length > 0;

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
          <div className="container mx-auto px-4 py-8">
            <CustomerBreadcrumbs />
            
            <CustomerHeader 
              userEmail={user?.email}
              onLogout={handleLogout}
            />
            
            {/* Navigation Section */}
            <div className="mb-8">
              <CustomerNavigation />
            </div>
            
            {/* Journey Guide - show when user hasn't completed the flow */}
            {(!hasLocation || !hasRestaurants || cart.length === 0) && (
              <div className="mb-8">
                <CustomerJourneyGuide
                  hasLocation={hasLocation}
                  hasRestaurants={hasRestaurants}
                  cartItems={cart.length}
                  isAuthenticated={!!user}
                />
              </div>
            )}
            
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
