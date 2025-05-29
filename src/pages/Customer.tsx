
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { MainContent } from '@/components/customer/MainContent';
import { ImprovedLocationPrompt } from '@/components/customer/ImprovedLocationPrompt';
import { CustomerErrorBoundary } from '@/components/customer/CustomerErrorBoundary';
import { CustomerBreadcrumbs } from '@/components/customer/CustomerBreadcrumbs';
import { CustomerNavigation } from '@/components/customer/CustomerNavigation';
import { RestaurantAssignmentDebug } from '@/components/customer/RestaurantAssignmentDebug';
import { LocationTroubleshootingGuide } from '@/components/customer/LocationTroubleshootingGuide';
import { AnimatedContainer } from '@/components/performance/AnimatedContainer';
import { useCustomerState } from '@/hooks/useCustomerState';
import { useLocationHandler } from '@/hooks/useLocationHandler';
import { useCart } from '@/contexts/CartContext';

const CustomerPage = () => {
  const navigate = useNavigate();
  const [isMapView, setIsMapView] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const { cart } = useCart();
  
  // Use the new location handler
  const locationHandler = useLocationHandler();
  
  // Use centralized state management
  const {
    user,
    restaurants,
    restaurantsError,
    menuItems,
    menuError,
    isLoading,
    hasError,
    errorMessage,
    clearErrors
  } = useCustomerState();

  const handleLogout = useCallback(async () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const toggleMapView = useCallback(() => {
    setIsMapView(prev => !prev);
  }, []);

  const hasLocation = !!locationHandler.location && locationHandler.permissionStatus === 'granted';
  const hasRestaurants = restaurants && restaurants.length > 0;
  const showLocationPrompt = !hasLocation && !locationHandler.isLoading;

  console.log('Customer page state:', {
    user: user?.email,
    location: !!locationHandler.location,
    restaurantsCount: restaurants?.length || 0,
    menuItemsCount: menuItems?.length || 0,
    isLoading,
    hasError,
    errorMessage,
    permissionStatus: locationHandler.permissionStatus,
    locationError: locationHandler.error
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
            
            {/* Navigation Section */}
            <AnimatedContainer animation="slideUp" delay={0.1}>
              <div className="mb-8">
                <CustomerNavigation />
              </div>
            </AnimatedContainer>
            
            {/* Debug Tools Toggle */}
            <AnimatedContainer animation="slideUp" delay={0.15}>
              <div className="mb-4">
                <button
                  onClick={() => setShowDebugTools(!showDebugTools)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {showDebugTools ? 'Hide' : 'Show'} Debug Tools
                </button>
              </div>
            </AnimatedContainer>
            
            {/* Debug Tools */}
            {showDebugTools && (
              <AnimatedContainer animation="slideUp" delay={0.2}>
                <div className="space-y-4 mb-8">
                  <RestaurantAssignmentDebug 
                    restaurants={restaurants || []}
                    location={locationHandler.location}
                  />
                  <LocationTroubleshootingGuide
                    permissionStatus={locationHandler.permissionStatus}
                    hasLocation={hasLocation}
                    error={locationHandler.error}
                  />
                </div>
              </AnimatedContainer>
            )}
            
            {/* Location Prompt */}
            {showLocationPrompt && (
              <AnimatedContainer animation="slideUp" delay={0.3}>
                <ImprovedLocationPrompt
                  onRequestLocation={locationHandler.requestLocation}
                  onManualLocation={locationHandler.setManualLocation}
                  isLoading={locationHandler.isLoading}
                  error={locationHandler.error}
                  hasRequestedPermission={locationHandler.hasRequestedPermission}
                  permissionStatus={locationHandler.permissionStatus}
                  onResetPermission={locationHandler.resetPermissionState}
                />
              </AnimatedContainer>
            )}
            
            {/* Main Content - Only show when location is available */}
            {hasLocation && (
              <AnimatedContainer animation="slideUp" delay={0.4}>
                <MainContent 
                  isMapView={isMapView}
                  menuItems={menuItems}
                  isLoading={isLoading}
                  error={hasError ? errorMessage : null}
                  nearbyRestaurants={restaurants}
                  toggleMapView={toggleMapView}
                  onLocationRequest={locationHandler.requestLocation}
                />
              </AnimatedContainer>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </CustomerErrorBoundary>
  );
};

export default CustomerPage;
