
import React, { useState, useCallback } from 'react';
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
import { AnimatedContainer } from '@/components/performance/AnimatedContainer';
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

  const handleLogout = useCallback(async () => {
    try {
      // Note: logout logic should be handled by auth context
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const toggleMapView = useCallback(() => {
    setIsMapView(prev => !prev);
  }, []);

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
        
        <main className="relative z-10 pt-20" role="main" aria-label="Customer Dashboard">
          <div className="container mx-auto px-4 py-8">
            <AnimatedContainer animation="slideUp">
              <CustomerBreadcrumbs />
            </AnimatedContainer>
            
            <AnimatedContainer animation="slideUp" delay={0.1}>
              <CustomerHeader 
                userEmail={user?.email}
                onLogout={handleLogout}
              />
            </AnimatedContainer>
            
            {/* Navigation Section */}
            <AnimatedContainer animation="slideUp" delay={0.2}>
              <div className="mb-8">
                <CustomerNavigation />
              </div>
            </AnimatedContainer>
            
            {/* Journey Guide - show when user hasn't completed the flow */}
            {(!hasLocation || !hasRestaurants || cart.length === 0) && (
              <AnimatedContainer animation="slideUp" delay={0.3}>
                <div className="mb-8">
                  <CustomerJourneyGuide
                    hasLocation={hasLocation}
                    hasRestaurants={hasRestaurants}
                    cartItems={cart.length}
                    isAuthenticated={!!user}
                  />
                </div>
              </AnimatedContainer>
            )}
            
            {/* Location prompt - only show if there's an issue or permission not requested */}
            {(hasLocationIssue || !hasRequestedPermission) && (
              <AnimatedContainer animation="slideUp" delay={0.4}>
                <LocationPrompt
                  onRequestLocation={requestLocation}
                  isLoading={isLoading}
                  error={locationError}
                  hasRequestedPermission={hasRequestedPermission}
                />
              </AnimatedContainer>
            )}
            
            <AnimatedContainer animation="slideUp" delay={0.5}>
              <MainContent 
                isMapView={isMapView}
                menuItems={menuItems}
                isLoading={isLoading}
                error={hasError ? errorMessage : null}
                nearbyRestaurants={restaurants}
                toggleMapView={toggleMapView}
                onLocationRequest={requestLocation}
              />
            </AnimatedContainer>
          </div>
        </main>
        
        <Footer />
      </div>
    </CustomerErrorBoundary>
  );
};

export default CustomerPage;
