
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { MainContent } from '@/components/customer/MainContent';
import { LocationPrompt } from '@/components/customer/LocationPrompt';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleLocation } from '@/hooks/useSimpleLocation';
import { useRestaurantsData } from '@/hooks/useRestaurantsData';
import { useMenuData } from '@/hooks/useMenuData';

const CustomerPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMapView, setIsMapView] = useState(false);
  
  // Location handling
  const {
    location,
    isLoading: locationLoading,
    error: locationError,
    permissionStatus,
    hasRequestedPermission,
    requestLocation
  } = useSimpleLocation();
  
  // Restaurant data
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants
  } = useRestaurantsData(location);
  
  // Menu data
  const { 
    data: menuItems = [], 
    isLoading: menuLoading, 
    error: menuError 
  } = useMenuData(restaurants);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMapView = () => {
    setIsMapView(!isMapView);
  };

  const handleLocationRequest = async () => {
    const success = await requestLocation();
    if (success) {
      refetchRestaurants();
    }
  };

  const isLoading = locationLoading || restaurantsLoading || menuLoading;
  const hasLocationIssue = locationError && permissionStatus !== 'granted';

  console.log('Customer page state:', {
    user: user?.email,
    location: !!location,
    restaurantsCount: restaurants?.length || 0,
    menuItemsCount: menuItems?.length || 0,
    isLoading,
    locationError,
    permissionStatus
  });

  return (
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
              onRequestLocation={handleLocationRequest}
              isLoading={locationLoading}
              error={locationError}
              hasRequestedPermission={hasRequestedPermission}
            />
          )}
          
          <MainContent 
            isMapView={isMapView}
            menuItems={menuItems}
            isLoading={isLoading}
            error={restaurantsError || menuError}
            nearbyRestaurants={restaurants}
            toggleMapView={toggleMapView}
            onLocationRequest={handleLocationRequest}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerPage;
